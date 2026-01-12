# PicUp

<p align="center">
  <img src="public/logo.svg" width="128" height="128" alt="PicUp Logo">
</p>

<p align="center">
  一款轻量、现代的 Windows 图片上传工具，专为腾讯云 COS 设计
  <br>
  像发朋友圈一样简单地管理你的图片资源
</p>

---

## 📸 它是做什么的？

**PicUp** 是一款运行在 Windows 上的小工具，旨在帮你快速将本地图片上传到**腾讯云对象存储 (COS)**，并自动生成 Markdown 或 URL 链接

无论你是写博客、做笔记（Obsidian/Notion），还是日常分享图片，PicUp 都能帮你省去“登录控制台 -> 上传 -> 复制链接”的繁琐步骤

## ✨ 核心亮点

*   **⚡️ 极速上传**：支持**拖拽上传**和**剪贴板上传**，一键搞定
*   **🎹 快捷键支持**：默认 `Ctrl+Shift+P` 瞬间上传剪贴板中的图片，不打断你的写作流
*   **🎨 原图保真**：完美保留 PNG/WebP 图片的**透明背景**，不做任何多余压缩
*   **🔗 自动复制**：上传成功后自动将链接写入剪贴板，支持 **Markdown** (`![]()`) 和 **URL** 两种格式
*   **☁️ 腾讯云 COS 深度支持**：
    *   支持配置多个存储桶（Bucket）或路径
    *   支持自定义域名（CDN）
    *   自动重命名策略（防止文件名冲突）
*   **📜 历史记录**：随时查看上传历史，想找回以前的链接也很方便
*   **🌍 双语界面**：原生支持简体中文与 English，可实时切换
*   **🛡️ 隐私安全**：所有的密钥（SecretId/SecretKey）仅保存在你本地电脑中，绝不上传至任何第三方服务器

## 🚀 快速开始

### 1. 准备工作
你需要拥有一个腾讯云账号，并开通对象存储（COS）服务
*   获取 `SecretId` 和 `SecretKey`
*   创建一个存储桶（Bucket），并记下存储桶名称和所属地区（Region，如 `ap-shanghai`）

### 2. 配置 PicUp
打开软件，进入 **“设置”** 页面，点击 **“添加配置”**：
*   **名称**：起个好记的名字（如“我的博客图床”）
*   **SecretId / SecretKey**：填入刚才获取的密钥
*   **Bucket**：存储桶名称（例如 `my-images-1250000000`）
*   **Region**：地区代码（例如 `ap-shanghai`）
*   **Path**：(可选) 图片存放的文件夹路径，例如 `blog/`

点击保存并设为“当前”即可

### 3. 开始使用
*   **拖拽**：把图片拖进主界面的框框里
*   **截图上传**：截图后，在软件界面点击“从剪贴板上传”，或者直接按下快捷键 `Ctrl+Shift+P`

## 🛠️ 开发者指南

如果你想自己修改代码或编译版本，可以按照以下步骤操作：

### 环境要求
*   Node.js 20+
*   npm

### 安装与运行
```bash
# 克隆项目
git clone https://github.com/your-username/picUp.git

# 进入目录
cd picUp

# 安装依赖
npm install

# 启动开发模式（支持热更新）
npm run dev
```

### 构建安装包
```bash
# 构建 Windows 可执行文件 (.exe)
npm run build
```
构建产物将位于 `release/` 目录下

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源你可以免费使用、修改和分发

---
*Made by Novice*
