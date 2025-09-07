const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的方法，允许渲染进程使用
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  
  // 显示消息框
  showMessageBox: (options: any): Promise<any> => ipcRenderer.invoke('show-message-box', options),
  
  // 平台信息
  platform: process.platform,
  
  // 版本信息
  versions: process.versions,

  // 文件操作
  selectMp3File: (): Promise<string | null> => ipcRenderer.invoke('select-mp3-file'),
  selectOutputDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-output-directory'),
  selectOutputFile: (defaultFileName: string): Promise<string | null> => ipcRenderer.invoke('select-output-file', defaultFileName),

  // ID3 操作
  checkID3Available: (): Promise<{ success: boolean; data?: boolean; error?: string }> => 
    ipcRenderer.invoke('check-id3-available'),
  getMp3Metadata: (filePath: string): Promise<{ success: boolean; data?: any; error?: string }> => 
    ipcRenderer.invoke('get-mp3-metadata', filePath),
  getMp3Duration: (filePath: string): Promise<{ success: boolean; data?: number; error?: string }> => 
    ipcRenderer.invoke('get-mp3-duration', filePath),
  extractChapters: (filePath: string): Promise<{ success: boolean; data?: any[]; error?: string }> => 
    ipcRenderer.invoke('extract-chapters', filePath),
  addChaptersToMp3: (params: { inputPath: string; outputPath: string; chapters: any[] }): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('add-chapters-to-mp3', params),

  // 章节数据管理
  saveChaptersToFile: (params: { filePath: string; chapters: any[] }): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('save-chapters-to-file', params),
  loadChaptersFromFile: (filePath: string): Promise<{ success: boolean; data?: any[]; error?: string }> => 
    ipcRenderer.invoke('load-chapters-from-file', filePath),

  // 图片操作
  selectImageFile: (): Promise<string | null> => ipcRenderer.invoke('select-image-file'),
  imageToBase64: (imagePath: string): Promise<{ success: boolean; data?: string; error?: string }> => 
    ipcRenderer.invoke('image-to-base64', imagePath),
  saveBase64Image: (params: { base64Data: string; outputPath: string }): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('save-base64-image', params)
});

// 类型声明已移至 src/renderer/types/index.ts
