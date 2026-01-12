/// <reference types="vite/client" />

import { AppSettings } from './types';

declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer
    picUp: {
      getSettings: () => Promise<AppSettings>;
      saveSettings: (settings: AppSettings) => Promise<boolean>;
      uploadClipboard: () => Promise<void>;
      uploadFiles: (paths: string[]) => Promise<void>;
      clearHistory: () => Promise<boolean>;
      openExternal: (url: string) => Promise<void>;
      closeNotification: () => Promise<void>;
      onHistoryUpdated: (callback: () => void) => () => void;
    }
  }
}
