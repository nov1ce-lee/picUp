import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, clipboard, globalShortcut, screen, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs-extra'
import Store from 'electron-store'
import COS from 'cos-nodejs-sdk-v5'
import { v4 as uuidv4 } from 'uuid'
import { AppSettings, DEFAULT_SETTINGS, UploadHistoryItem, CosConfig } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null = null
let isQuitting = false
const store = new Store<AppSettings>({ defaults: DEFAULT_SETTINGS })

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'PicUp',
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'), // Use png for window icon too
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false // Simplify local file access
    },
  })

  win.setMenuBarVisibility(false) // Hide default menu bar

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Hide instead of close
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win?.hide()
    }
    return false
  })
}

// Notification Window
let notificationWin: BrowserWindow | null = null

function showNotification(type: 'success' | 'error' | 'info', message: string, url?: string, detail?: string) {
  if (notificationWin) {
    notificationWin.close()
    notificationWin = null
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  
  notificationWin = new BrowserWindow({
    width: 320,
    height: 80,
    x: width - 340,
    y: height - 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    }
  })

  const currentLang = store.get('language') || 'zh'
  const notifyUrl = VITE_DEV_SERVER_URL 
    ? `${VITE_DEV_SERVER_URL}#/notification?type=${type}&message=${encodeURIComponent(message)}&url=${encodeURIComponent(url || '')}&detail=${encodeURIComponent(detail || '')}&lng=${currentLang}`
    : `file://${path.join(RENDERER_DIST, 'index.html')}#/notification?type=${type}&message=${encodeURIComponent(message)}&url=${encodeURIComponent(url || '')}&detail=${encodeURIComponent(detail || '')}&lng=${currentLang}`

  notificationWin.loadURL(notifyUrl)

  // Auto close after 5 seconds
  setTimeout(() => {
    if (notificationWin && !notificationWin.isDestroyed()) {
      notificationWin.close()
      notificationWin = null
    }
  }, 5000)
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, 'logo.png'))
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Settings', click: () => win?.show() },
    { label: 'Quit', click: () => {
      isQuitting = true
      app.quit()
    }}
  ])
  tray.setToolTip('PicUp')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    win?.show()
  })
}

// COS Helpers
function getCosClient(config: CosConfig) {
  return new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  })
}

async function getUniqueFileName(cos: COS, bucket: string, region: string, key: string): Promise<string> {
  let finalKey = key
  let counter = 2
  const ext = path.extname(key)
  const name = path.basename(key, ext)
  const dir = path.dirname(key)
  
  // Simple check loop
  while (true) {
    try {
      await cos.headObject({
        Bucket: bucket,
        Region: region,
        Key: finalKey
      })
      // If exists (no error), try next name
      finalKey = path.join(dir, `${name}(${counter})${ext}`).replace(/\\/g, '/')
      counter++
    } catch (err: any) {
      if (err.statusCode === 404) {
        return finalKey
      }
      throw err
    }
  }
}

async function uploadFileToCos(filePath: string, source: 'clipboard' | 'file') {
  const settings = store.get('cosConfigs') as CosConfig[]
  const currentId = store.get('currentConfigId') as string
  const config = settings.find(c => c.id === currentId)

  if (!config) {
    showNotification('error', 'configure_cos_first')
    return
  }

  const cos = getCosClient(config)
  const fileName = path.basename(filePath)
  const key = path.join(config.path, fileName).replace(/\\/g, '/') // Ensure forward slashes

  try {
    const finalKey = await getUniqueFileName(cos, config.bucket, config.region, key)
    
    await cos.putObject({
      Bucket: config.bucket,
      Region: config.region,
      Key: finalKey,
      Body: fs.createReadStream(filePath),
    })

    const url = config.customDomain 
      ? `${config.customDomain}/${finalKey}`
      : `https://${config.bucket}.cos.${config.region}.myqcloud.com/${finalKey}`

    // Update History
    const historyItem: UploadHistoryItem = {
      id: uuidv4(),
      url,
      fileName: path.basename(finalKey),
      timestamp: Date.now(),
      status: 'success'
    }
    const history = store.get('uploadHistory') as UploadHistoryItem[] || []
    store.set('uploadHistory', [historyItem, ...history].slice(0, 100))

    // Copy to clipboard
    const autoCopy = store.get('autoCopy')
    const copyFormat = store.get('copyFormat')
    if (autoCopy) {
      const textToCopy = copyFormat === 'markdown' ? `![${historyItem.fileName}](${url})` : url
      clipboard.writeText(textToCopy)
    }

    showNotification('success', 'upload_success', url)
    
    // Notify renderer to refresh history
    win?.webContents.send('history-updated')

  } catch (err: any) {
    console.error(err)
    showNotification('error', `Upload Failed: ${err.message}`)
  } finally {
    // If it was a temp file from clipboard, delete it
    if (source === 'clipboard') {
      fs.remove(filePath).catch(console.error)
    }
  }
}

async function handleClipboardUpload() {
  // 1. Try to read image from clipboard
  const image = clipboard.readImage()
  if (!image.isEmpty()) {
    const buffer = image.toPNG()
    const tempPath = path.join(app.getPath('temp'), `picup_clip_${Date.now()}.png`)
    await fs.writeFile(tempPath, buffer)
    await uploadFileToCos(tempPath, 'clipboard')
    return
  }

  // 2. Try to read file paths from clipboard (for Windows/macOS file copy)
  // On Windows, when copying a file, clipboard has 'FileNameW' format
  // Electron's clipboard.readBuffer can read it.
  if (process.platform === 'win32') {
    const rawFilePath = clipboard.readBuffer('FileNameW').toString('ucs2').replace(new RegExp(String.fromCharCode(0), 'g'), '');
    if (rawFilePath && await fs.pathExists(rawFilePath)) {
       // Only allow images
       const ext = path.extname(rawFilePath).toLowerCase();
       if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'].includes(ext)) {
         await uploadFileToCos(rawFilePath, 'file');
         return;
       }
    }
  } else {
    // macOS uses 'public.file-url'
    const fileUrl = clipboard.read('public.file-url');
    if (fileUrl) {
       const filePath = fileURLToPath(fileUrl);
       if (filePath && await fs.pathExists(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'].includes(ext)) {
            await uploadFileToCos(filePath, 'file');
            return;
          }
       }
    }
  }
  
  showNotification('error', 'clipboard_empty')
}

// App Events
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Do not quit, keep in tray
    // app.quit() 
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  // Register Shortcut
  const shortcuts = store.get('shortcuts') as any
  if (shortcuts?.uploadClipboard) {
    globalShortcut.register(shortcuts.uploadClipboard, () => {
      handleClipboardUpload()
    })
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// IPC Handlers
ipcMain.handle('get-settings', () => store.store)
ipcMain.handle('save-settings', (_, newSettings: AppSettings) => {
  store.set(newSettings)
  // Re-register shortcuts
  globalShortcut.unregisterAll()
  if (newSettings.shortcuts.uploadClipboard) {
    globalShortcut.register(newSettings.shortcuts.uploadClipboard, () => {
      handleClipboardUpload()
    })
  }
  return true
})

ipcMain.handle('upload-clipboard', () => handleClipboardUpload())
ipcMain.handle('upload-files', async (_, paths: string[]) => {
  for (const p of paths) {
    await uploadFileToCos(p, 'file')
  }
})
ipcMain.handle('clear-history', () => {
  store.set('uploadHistory', [])
  return true
})
ipcMain.handle('open-external', (_, url) => {
  shell.openExternal(url)
})
ipcMain.handle('close-notification', () => {
  if (notificationWin) {
    notificationWin.close()
    notificationWin = null
  }
})

  // Add property to app to handle quit flag
  // Object.defineProperty(app, 'isQuitting', {
  //   value: false,
  //   writable: true
  // })
