export interface CosConfig {
  id: string;
  name: string; // e.g. "Personal Blog", "Work"
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  path: string; // e.g. "images/"
  customDomain?: string; // Optional custom domain
}

export interface UploadHistoryItem {
  id: string;
  url: string;
  fileName: string;
  timestamp: number;
  status: 'success' | 'fail';
  error?: string;
}

export interface AppSettings {
  cosConfigs: CosConfig[];
  currentConfigId: string;
  uploadHistory: UploadHistoryItem[];
  shortcuts: {
    uploadClipboard: string;
  };
  autoCopy: boolean; // Auto copy link after upload
  copyFormat: 'markdown' | 'url'; // Copy format
  language: string; // 'zh' or 'en'
}

export const DEFAULT_SETTINGS: AppSettings = {
  cosConfigs: [],
  currentConfigId: '',
  uploadHistory: [],
  shortcuts: {
    uploadClipboard: 'CommandOrControl+Shift+P',
  },
  autoCopy: true,
  copyFormat: 'markdown',
  language: 'zh',
};
