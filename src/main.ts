import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { ID3Service, ChapterInfo } from './id3-service.js';

// Alternative to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference to the window object to avoid garbage collection
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Optional: app icon
    show: false, // Don't show initially, wait for load to complete
    titleBarStyle: 'default'
  });

  // Load the app's index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Triggered when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open dev tools in development environment
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Called when Electron finishes initialization and is ready to create browser windows
app.whenReady().then(() => {
  createWindow();

  // On macOS, when clicking the dock icon and no other windows are open,
  // usually recreate a window in the app
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, unless the user explicitly quits with Cmd + Q,
  // most apps and their menu bar stay active
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC communication examples
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  return await dialog.showMessageBox(mainWindow!, options);
});

// ID3 related IPC handling
const id3Service = ID3Service.getInstance();

// Select MP3 file
ipcMain.handle('select-mp3-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select MP3 File',
    filters: [
      { name: 'MP3 Files', extensions: ['mp3'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Select output directory
ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Output Directory',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Select output file
ipcMain.handle('select-output-file', async (event, defaultFileName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Select Output File Location',
    defaultPath: defaultFileName,
    filters: [
      { name: 'MP3 Files', extensions: ['mp3'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePath) {
    return result.filePath;
  }
  return null;
});

// Get MP3 file metadata
ipcMain.handle('get-mp3-metadata', async (event, filePath: string) => {
  try {
    const metadata = await id3Service.getMetadata(filePath);
    return { success: true, data: metadata };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Get MP3 file duration
ipcMain.handle('get-mp3-duration', async (event, filePath: string) => {
  try {
    const duration = await id3Service.getMp3Duration(filePath);
    return { success: true, data: duration };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Extract chapter information from MP3 file
ipcMain.handle('extract-chapters', async (event, filePath: string) => {
  try {
    const chapters = await id3Service.extractChaptersFromMp3(filePath);
    return { success: true, data: chapters };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Add chapters to MP3 file
ipcMain.handle('add-chapters-to-mp3', async (event, { inputPath, outputPath, chapters }: { inputPath: string, outputPath: string, chapters: ChapterInfo[] }) => {
  console.log('Main process: Starting to add chapters to MP3', {
    inputPath,
    outputPath,
    chaptersCount: chapters.length,
    chapters: chapters
  });
  
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }
    
    // Check if output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory does not exist: ${outputDir}`);
    }
    
    // Check chapter data
    if (!chapters || chapters.length === 0) {
      throw new Error('No chapter data');
    }
    
    // Validate chapter time format
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter.startTime) {
        throw new Error(`Chapter ${i + 1} missing start time`);
      }
      if (!chapter.title) {
        throw new Error(`Chapter ${i + 1} missing title`);
      }
    }
    
    console.log('Main process: Starting to call ID3 service...');
    await id3Service.addChaptersToMp3(inputPath, outputPath, chapters);
    console.log('Main process: Chapters added successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Main process: Failed to add chapters:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// Check if ID3 service is available
ipcMain.handle('check-id3-available', async () => {
  try {
    const available = await id3Service.checkID3Available();
    return { success: true, data: available };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Save chapter data to file
ipcMain.handle('save-chapters-to-file', async (event, { filePath, chapters }: { filePath: string, chapters: ChapterInfo[] }) => {
  try {
    const data = JSON.stringify(chapters, null, 2);
    await fs.promises.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Load chapter data from file
ipcMain.handle('load-chapters-from-file', async (event, filePath: string) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const chapters = JSON.parse(data);
    return { success: true, data: chapters };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// Image related operations
// Select image file
ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select Image File',
    filters: [
      { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Convert image to base64
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

// Save base64 image
ipcMain.handle('save-base64-image', async (event, { base64Data, outputPath }: { base64Data: string, outputPath: string }) => {
  try {
    const fs = await import('fs');
    // Remove data URL prefix
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(outputPath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});
