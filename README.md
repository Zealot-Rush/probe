# 🎵 Probe - MP3 Chapter Management Tool

A powerful cross-platform desktop application designed for MP3 file chapter management. Built with modern technology stack, providing intuitive user interface and powerful audio processing capabilities.

## ✨ Core Features

### 🎯 Chapter Management
- **Auto Extraction** - Intelligently identify existing chapter information in MP3 files
- **Manual Addition** - Flexibly add custom chapters with precise time settings
- **Batch Editing** - Quickly edit multiple chapters' titles, times, and descriptions
- **Image Support** - Add cover images for each chapter, supporting multiple formats

### 🎨 User Experience
- **Modern Interface** - Beautiful, responsive design based on Tailwind CSS
- **Real-time Preview** - Instantly display chapter information and file duration
- **Drag & Drop** - Intuitive file selection and operation workflow
- **Status Feedback** - Clear processing progress and status indicators

### 🔧 Technical Advantages
- **Cross-platform** - Support for Windows, macOS, Linux
- **High Performance** - Native application performance based on Electron
- **Type Safety** - Complete TypeScript support
- **Modular** - Clear code structure and componentized design

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | ^38.0.0 | Cross-platform desktop app framework |
| **React** | ^19.1.1 | Modern user interface library |
| **TypeScript** | ^5.0.0 | Type-safe JavaScript |
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS framework |
| **node-id3** | ^0.2.9 | ID3 tag processing library |
| **Webpack** | ^5.101.3 | Module bundler and dev server |

## 📋 System Requirements

- **Node.js** 16.0+ 
- **FFmpeg** (for getting audio duration information)
- **Operating System** Windows 10+, macOS 10.14+, or Linux

## 🚀 Quick Start

### 1. Clone the project
```bash
git clone <repository-url>
cd probe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Development mode
```bash
# Start development server and Electron app
npm run dev
```

### 4. Build application
```bash
# Build production version
npm run build

# Start application
npm start
```

### 5. Package distribution
```bash
# Build all platforms
npm run dist

# Build specific platform
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## 📁 Project Structure

```
probe/
├── src/
│   ├── main.ts                    # Electron main process
│   ├── preload.ts                 # Preload script
│   ├── id3-service.ts             # ID3 tag processing service
│   └── renderer/                  # React renderer process
│       ├── components/
│       │   ├── FileSelector.tsx   # File selection component
│       │   └── ChapterManager.tsx # Chapter management component
│       ├── hooks/
│       │   └── useElectronAPI.ts  # Electron API Hook
│       ├── types/
│       │   └── index.ts           # TypeScript type definitions
│       ├── App.tsx                # Main application component
│       ├── index.tsx              # Entry file
│       ├── index.html             # HTML template
│       └── index.css              # Style file
├── dist/                          # Build output directory
├── test/                          # Test files
├── webpack.config.js              # Webpack configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project configuration
```

## 🎯 Feature Details

### File Processing
- **MP3 File Selection** - Support for standard MP3 format files
- **Metadata Reading** - Automatically get file duration, size and other information
- **Format Validation** - Ensure file format compatibility

### Chapter Operations
- **Extract Existing Chapters** - Read existing chapter information from MP3 files
- **Add New Chapters** - Manually create chapters with precise time settings
- **Edit Chapters** - Modify chapter titles, times, descriptions and images
- **Delete Chapters** - Remove unwanted chapters

### Image Management
- **Multi-format Support** - JPG, PNG, GIF, BMP, WebP
- **Base64 Encoding** - Automatically convert images to Base64 format for storage
- **Preview Function** - Real-time preview of chapter images
- **Type Identification** - Distinguish between auto-extracted and manually selected images

### Data Persistence
- **Chapter Saving** - Save chapter data as JSON files
- **Data Loading** - Load chapter data from JSON files
- **Backup Mechanism** - Automatically backup original files before processing

## 🔧 Development Guide

### Build Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build main process and renderer process |
| `npm run build:main` | Build main process only |
| `npm run build:preload` | Build preload script only |
| `npm run build:renderer` | Build renderer process only |
| `npm run build:watch` | Watch mode build |
| `npm run clean` | Clean build files |

### Development Tools

- **TypeScript** - Provides complete type checking and intelligent suggestions
- **Webpack** - Module bundling and hot reload support
- **Tailwind CSS** - Fast style development and responsive design
- **ESLint** - Code quality checking (recommended configuration)

### Code Structure

- **Main Process** (`main.ts`) - Handles file system operations and IPC communication
- **Preload Script** (`preload.ts`) - Safely exposes APIs to renderer process
- **ID3 Service** (`id3-service.ts`) - Handles MP3 tags and chapter data
- **React Components** - Modular UI components, easy to maintain and extend

## 📝 User Guide

### Basic Workflow

1. **Start Application** - Run `npm run dev` or `npm start`
2. **Select File** - Click "Select File" button to choose MP3 file
3. **Manage Chapters** - Auto-extract or manually add chapter information
4. **Add Images** - Select cover images for chapters (optional)
5. **Save File** - Choose output location and add chapters to MP3 file

### Advanced Features

- **Batch Operations** - Edit multiple chapters simultaneously
- **Time Format** - Support `HH:MM:SS.sss` format time input
- **Image Optimization** - Automatically handle image format and size
- **Error Handling** - Detailed error information and handling suggestions

## ⚠️ Important Notes

### System Requirements
- Ensure FFmpeg is installed and accessible from command line
- Large file processing may take a long time, please be patient
- It's recommended to backup original files before processing

### Compatibility
- Supports standard MP3 format files
- Chapter information follows ID3v2 standard
- Image formats support common formats (JPG, PNG, GIF, etc.)

### Performance Optimization
- Close other applications when processing large files
- Regularly clean temporary files to free up disk space
- Using SSD storage can significantly improve processing speed

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome!

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Zealot-Rush** - [GitHub](https://github.com/Zealot-Rush)

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Cross-platform desktop app framework
- [React](https://reactjs.org/) - User interface library
- [node-id3](https://github.com/Zazama/node-id3) - ID3 tag processing library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

If you have any questions or suggestions, please submit an [Issue](https://github.com/Zealot-Rush/probe/issues) or [Pull Request](https://github.com/Zealot-Rush/probe/pulls)!
