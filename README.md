# 🎵 Probe - MP3章节管理工具

一个功能强大的跨平台桌面应用程序，专为MP3文件的章节管理而设计。基于现代化的技术栈构建，提供直观的用户界面和强大的音频处理能力。

## ✨ 核心特性

### 🎯 章节管理
- **自动提取** - 智能识别MP3文件中现有的章节信息
- **手动添加** - 灵活添加自定义章节，支持精确时间设置
- **批量编辑** - 快速编辑多个章节的标题、时间和描述
- **图片支持** - 为每个章节添加封面图片，支持多种格式

### 🎨 用户体验
- **现代化界面** - 基于Tailwind CSS的美观、响应式设计
- **实时预览** - 即时显示章节信息和文件时长
- **拖拽操作** - 直观的文件选择和操作流程
- **状态反馈** - 清晰的处理进度和状态提示

### 🔧 技术优势
- **跨平台** - 支持Windows、macOS、Linux
- **高性能** - 基于Electron的本地应用性能
- **类型安全** - 完整的TypeScript支持
- **模块化** - 清晰的代码结构和组件化设计

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Electron** | ^38.0.0 | 跨平台桌面应用框架 |
| **React** | ^19.1.1 | 现代化用户界面库 |
| **TypeScript** | ^5.0.0 | 类型安全的JavaScript |
| **Tailwind CSS** | ^3.4.17 | 实用优先的CSS框架 |
| **node-id3** | ^0.2.9 | ID3标签处理库 |
| **Webpack** | ^5.101.3 | 模块打包和开发服务器 |

## 📋 系统要求

- **Node.js** 16.0+ 
- **FFmpeg** (用于获取音频时长信息)
- **操作系统** Windows 10+, macOS 10.14+, 或 Linux

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd probe
```

### 2. 安装依赖
```bash
npm install
```

### 3. 开发模式
```bash
# 启动开发服务器和Electron应用
npm run dev
```

### 4. 构建应用
```bash
# 构建生产版本
npm run build

# 启动应用
npm start
```

### 5. 打包分发
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
│   ├── main.ts                    # Electron主进程
│   ├── preload.ts                 # 预加载脚本
│   ├── id3-service.ts             # ID3标签处理服务
│   └── renderer/                  # React渲染进程
│       ├── components/
│       │   ├── FileSelector.tsx   # 文件选择组件
│       │   └── ChapterManager.tsx # 章节管理组件
│       ├── hooks/
│       │   └── useElectronAPI.ts  # Electron API Hook
│       ├── types/
│       │   └── index.ts           # TypeScript类型定义
│       ├── App.tsx                # 主应用组件
│       ├── index.tsx              # 入口文件
│       ├── index.html             # HTML模板
│       └── index.css              # 样式文件
├── dist/                          # 构建输出目录
├── test/                          # 测试文件
├── webpack.config.js              # Webpack配置
├── tailwind.config.js             # Tailwind配置
├── tsconfig.json                  # TypeScript配置
└── package.json                   # 项目配置
```

## 🎯 功能详解

### 文件处理
- **MP3文件选择** - 支持标准MP3格式文件
- **元数据读取** - 自动获取文件时长、大小等信息
- **格式验证** - 确保文件格式兼容性

### 章节操作
- **提取现有章节** - 从MP3文件中读取已存在的章节信息
- **添加新章节** - 手动创建章节，支持精确时间设置
- **编辑章节** - 修改章节标题、时间、描述和图片
- **删除章节** - 移除不需要的章节

### 图片管理
- **多格式支持** - JPG、PNG、GIF、BMP、WebP
- **Base64编码** - 自动转换图片为Base64格式存储
- **预览功能** - 实时预览章节图片
- **类型标识** - 区分自动提取和手动选择的图片

### 数据持久化
- **章节保存** - 将章节数据保存为JSON文件
- **数据加载** - 从JSON文件加载章节数据
- **备份机制** - 处理前自动备份原始文件

## 🔧 开发指南

### 构建脚本

| 命令 | 描述 |
|------|------|
| `npm run build` | 构建主进程和渲染进程 |
| `npm run build:main` | 仅构建主进程 |
| `npm run build:preload` | 仅构建预加载脚本 |
| `npm run build:renderer` | 仅构建渲染进程 |
| `npm run build:watch` | 监听模式构建 |
| `npm run clean` | 清理构建文件 |

### 开发工具

- **TypeScript** - 提供完整的类型检查和智能提示
- **Webpack** - 模块打包和热重载支持
- **Tailwind CSS** - 快速样式开发和响应式设计
- **ESLint** - 代码质量检查（推荐配置）

### 代码结构

- **主进程** (`main.ts`) - 处理文件系统操作和IPC通信
- **预加载脚本** (`preload.ts`) - 安全地暴露API给渲染进程
- **ID3服务** (`id3-service.ts`) - 处理MP3标签和章节数据
- **React组件** - 模块化的UI组件，易于维护和扩展

## 📝 使用指南

### 基本流程

1. **启动应用** - 运行 `npm run dev` 或 `npm start`
2. **选择文件** - 点击"选择文件"按钮选择MP3文件
3. **管理章节** - 自动提取或手动添加章节信息
4. **添加图片** - 为章节选择封面图片（可选）
5. **保存文件** - 选择输出位置并添加章节到MP3文件

### 高级功能

- **批量操作** - 同时编辑多个章节
- **时间格式** - 支持 `HH:MM:SS.sss` 格式的时间输入
- **图片优化** - 自动处理图片格式和大小
- **错误处理** - 详细的错误信息和处理建议

## ⚠️ 注意事项

### 系统要求
- 确保系统已安装FFmpeg并可在命令行中访问
- 处理大文件时可能需要较长时间，请耐心等待
- 建议在处理前备份原始文件

### 兼容性
- 支持标准MP3格式文件
- 章节信息遵循ID3v2标准
- 图片格式支持常见格式（JPG、PNG、GIF等）

### 性能优化
- 大文件处理时建议关闭其他应用程序
- 定期清理临时文件以释放磁盘空间
- 使用SSD存储可显著提升处理速度

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**Zealot-Rush** - [GitHub](https://github.com/Zealot-Rush)

## 🙏 致谢

- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [node-id3](https://github.com/Zazama/node-id3) - ID3标签处理库
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

如有问题或建议，欢迎提交 [Issue](https://github.com/Zealot-Rush/probe/issues) 或 [Pull Request](https://github.com/Zealot-Rush/probe/pulls)！
