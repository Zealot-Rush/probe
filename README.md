# Probe - MP3章节添加工具

一个基于Electron、React、TypeScript和Tailwind CSS开发的现代化桌面应用程序，用于为MP3文件添加和管理章节信息。

## ✨ 功能特性

- 🎵 **MP3文件处理** - 支持MP3文件的章节添加和分割
- 🖥️ **跨平台支持** - 支持Windows、macOS、Linux
- ⚡ **现代化技术栈** - Electron + React + TypeScript + Tailwind CSS
- 🎨 **美观界面** - 基于Tailwind CSS的现代化UI设计
- 🔧 **FFmpeg集成** - 使用FFmpeg进行音频处理
- 📁 **文件管理** - 支持章节数据的保存和加载

## 🛠️ 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **Webpack** - 模块打包工具
- **FFmpeg** - 音频处理工具

## 📋 系统要求

- Node.js 16.0 或更高版本
- FFmpeg (需要系统安装或配置路径)

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
# 启动开发服务器
npm run dev
```

### 3. 构建应用

```bash
# 构建生产版本
npm run build

# 启动应用
npm start
```

### 4. 打包分发

```bash
# 构建所有平台
npm run dist

# 构建特定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## 📁 项目结构

```
probe/
├── src/
│   ├── main.ts              # Electron主进程
│   ├── preload.ts           # 预加载脚本
│   ├── ffmpeg-service.ts    # FFmpeg服务
│   └── renderer/            # React渲染进程
│       ├── components/      # React组件
│       ├── hooks/          # 自定义Hooks
│       ├── types/          # TypeScript类型定义
│       ├── App.tsx         # 主应用组件
│       ├── index.tsx       # 入口文件
│       ├── index.html      # HTML模板
│       └── index.css       # 样式文件
├── dist/                   # 构建输出目录
├── webpack.config.js       # Webpack配置
├── tailwind.config.js      # Tailwind配置
├── tsconfig.json           # TypeScript配置
└── package.json           # 项目配置
```

## 🎯 主要功能

### 文件操作
- 选择MP3文件
- 显示文件信息（时长、大小等）
- 选择输出目录

### 章节管理
- 提取现有章节
- 手动添加章节
- 编辑章节信息
- 保存/加载章节数据

### 音频处理
- 为MP3文件添加章节信息
- 根据章节分割MP3文件
- 使用FFmpeg进行高质量音频处理

## 🔧 开发说明

### 构建脚本

- `npm run build` - 构建主进程和渲染进程
- `npm run build:main` - 仅构建主进程
- `npm run build:renderer` - 仅构建渲染进程
- `npm run build:watch` - 监听模式构建
- `npm run clean` - 清理构建文件

### 开发工具

- **TypeScript** - 提供类型检查和智能提示
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Webpack** - 模块打包和热重载

## 📝 使用说明

1. **选择MP3文件** - 点击"选择文件"按钮选择要处理的MP3文件
2. **管理章节** - 可以提取现有章节或手动添加新章节
3. **设置输出** - 选择输出目录用于保存处理后的文件
4. **执行操作** - 选择添加章节到文件或分割文件

## ⚠️ 注意事项

- 确保系统已安装FFmpeg
- 处理大文件时可能需要较长时间
- 建议在处理前备份原始文件

## 📄 许可证

MIT License

## 👨‍💻 作者

Zealot-Rush

---

如有问题或建议，欢迎提交Issue或Pull Request！
