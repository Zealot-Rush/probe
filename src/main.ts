import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { ID3Service, ChapterInfo } from './id3-service.js';

// 在ES模块中获取__dirname的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'), // 可选：应用图标
    show: false, // 先不显示，等加载完成后再显示
    titleBarStyle: 'default'
  });

  // 加载应用的 index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 当窗口准备好时显示
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信示例
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  return await dialog.showMessageBox(mainWindow!, options);
});

// ID3 相关 IPC 处理
const id3Service = ID3Service.getInstance();

// 选择MP3文件
ipcMain.handle('select-mp3-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择MP3文件',
    filters: [
      { name: 'MP3文件', extensions: ['mp3'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 选择输出目录
ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择输出目录',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 获取MP3文件元数据
ipcMain.handle('get-mp3-metadata', async (event, filePath: string) => {
  try {
    const metadata = await id3Service.getMetadata(filePath);
    return { success: true, data: metadata };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 获取MP3文件时长
ipcMain.handle('get-mp3-duration', async (event, filePath: string) => {
  try {
    const duration = await id3Service.getMp3Duration(filePath);
    return { success: true, data: duration };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 从MP3文件提取章节信息
ipcMain.handle('extract-chapters', async (event, filePath: string) => {
  try {
    const chapters = await id3Service.extractChaptersFromMp3(filePath);
    return { success: true, data: chapters };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 为MP3文件添加章节
ipcMain.handle('add-chapters-to-mp3', async (event, { inputPath, outputPath, chapters }: { inputPath: string, outputPath: string, chapters: ChapterInfo[] }) => {
  console.log('主进程: 开始添加章节到MP3', {
    inputPath,
    outputPath,
    chaptersCount: chapters.length,
    chapters: chapters
  });
  
  try {
    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      throw new Error(`输入文件不存在: ${inputPath}`);
    }
    
    // 检查输出目录是否存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      throw new Error(`输出目录不存在: ${outputDir}`);
    }
    
    // 检查章节数据
    if (!chapters || chapters.length === 0) {
      throw new Error('没有章节数据');
    }
    
    // 验证章节时间格式
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter.startTime) {
        throw new Error(`章节 ${i + 1} 缺少开始时间`);
      }
      if (!chapter.title) {
        throw new Error(`章节 ${i + 1} 缺少标题`);
      }
    }
    
    console.log('主进程: 开始调用ID3服务...');
    await id3Service.addChaptersToMp3(inputPath, outputPath, chapters);
    console.log('主进程: 章节添加成功');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('主进程: 添加章节失败:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 检查ID3服务是否可用
ipcMain.handle('check-id3-available', async () => {
  try {
    const available = await id3Service.checkID3Available();
    return { success: true, data: available };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 保存章节数据到文件
ipcMain.handle('save-chapters-to-file', async (event, { filePath, chapters }: { filePath: string, chapters: ChapterInfo[] }) => {
  try {
    const data = JSON.stringify(chapters, null, 2);
    await fs.promises.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 从文件加载章节数据
ipcMain.handle('load-chapters-from-file', async (event, filePath: string) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const chapters = JSON.parse(data);
    return { success: true, data: chapters };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 图片相关操作
// 选择图片文件
ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: '选择图片文件',
    filters: [
      { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 将图片转换为base64
ipcMain.handle('image-to-base64', async (event, imagePath: string) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const imageBuffer = await fs.promises.readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                    ext === '.png' ? 'image/png' : 
                    ext === '.gif' ? 'image/gif' : 'image/jpeg';
    return { success: true, data: `data:${mimeType};base64,${base64}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 保存base64图片
ipcMain.handle('save-base64-image', async (event, { base64Data, outputPath }: { base64Data: string, outputPath: string }) => {
  try {
    const fs = await import('fs');
    // 移除data URL前缀
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(outputPath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});
