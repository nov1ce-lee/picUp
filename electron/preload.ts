import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

contextBridge.exposeInMainWorld('picUp', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  uploadClipboard: () => ipcRenderer.invoke('upload-clipboard'),
  uploadFiles: (paths: string[]) => ipcRenderer.invoke('upload-files', paths),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  closeNotification: () => ipcRenderer.invoke('close-notification'),
  onHistoryUpdated: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('history-updated', listener)
    return () => ipcRenderer.off('history-updated', listener)
  },
})
