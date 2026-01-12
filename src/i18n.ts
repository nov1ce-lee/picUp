import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "upload": "Upload",
          "history": "History",
          "settings": "Settings",
          "upload_images": "Upload Images",
          "click_drag": "Click or drag file to this area to upload",
          "upload_clipboard": "Upload from Clipboard",
          "shortcut_hint": "Shortcut: {{shortcut}} (Default)",
          "copy_markdown": "Copy Markdown",
          "copy_url": "Copy URL",
          "open_browser": "Open in Browser",
          "clear_history": "Clear History",
          "confirm_clear": "Clear all history?",
          "add_config": "Add Config",
          "edit_config": "Edit Config",
          "general_settings": "General Settings",
          "auto_copy": "Auto Copy Link",
          "copy_format": "Copy Format",
          "language": "Language",
          "shortcut_clipboard": "Shortcut (Clipboard Upload)",
          "name": "Name",
          "secret_id": "SecretId",
          "secret_key": "SecretKey",
          "bucket": "Bucket",
          "region": "Region",
          "path": "Path",
          "custom_domain": "Custom Domain (Optional)",
          "save": "Save",
          "cancel": "Cancel",
          "use": "Use",
          "active": "Active",
          "delete": "Delete",
          "delete_confirm": "Delete?",
          "settings_saved": "Settings saved",
          "history_cleared": "History cleared",
          "copied": "Copied!"
        }
      },
      zh: {
        translation: {
          "upload": "上传",
          "history": "历史记录",
          "settings": "设置",
          "upload_images": "上传图片",
          "click_drag": "点击或拖拽文件到此区域上传",
          "upload_clipboard": "从剪贴板上传",
          "shortcut_hint": "快捷键: {{shortcut}} (默认)",
          "copy_markdown": "复制 Markdown",
          "copy_url": "复制链接",
          "open_browser": "在浏览器打开",
          "clear_history": "清空历史",
          "confirm_clear": "确定清空所有历史记录吗？",
          "add_config": "添加配置",
          "edit_config": "编辑配置",
          "general_settings": "通用设置",
          "auto_copy": "上传后自动复制",
          "copy_format": "复制格式",
          "language": "语言",
          "shortcut_clipboard": "快捷键 (剪贴板上传)",
          "name": "名称",
          "secret_id": "SecretId",
          "secret_key": "SecretKey",
          "bucket": "存储桶 (Bucket)",
          "region": "地区 (Region)",
          "path": "路径",
          "custom_domain": "自定义域名 (可选)",
          "save": "保存",
          "cancel": "取消",
          "use": "使用",
          "active": "当前",
          "delete": "删除",
          "delete_confirm": "确定删除？",
          "settings_saved": "设置已保存",
          "history_cleared": "历史记录已清空",
          "copied": "已复制!"
        }
      }
    }
  });

export default i18n;
