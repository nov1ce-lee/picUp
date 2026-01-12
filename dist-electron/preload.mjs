"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("picUp", {
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => electron.ipcRenderer.invoke("save-settings", settings),
  uploadClipboard: () => electron.ipcRenderer.invoke("upload-clipboard"),
  uploadFiles: (paths) => electron.ipcRenderer.invoke("upload-files", paths),
  clearHistory: () => electron.ipcRenderer.invoke("clear-history"),
  openExternal: (url) => electron.ipcRenderer.invoke("open-external", url),
  closeNotification: () => electron.ipcRenderer.invoke("close-notification"),
  onHistoryUpdated: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("history-updated", listener);
    return () => electron.ipcRenderer.off("history-updated", listener);
  }
});
