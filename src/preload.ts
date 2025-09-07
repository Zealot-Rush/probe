const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('electronAPI', {
  // Get application version
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  
  // Show message box
  showMessageBox: (options: any): Promise<any> => ipcRenderer.invoke('show-message-box', options),
  
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: process.versions,

  // File operations
  selectMp3File: (): Promise<string | null> => ipcRenderer.invoke('select-mp3-file'),
  selectOutputDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-output-directory'),
  selectOutputFile: (defaultFileName: string): Promise<string | null> => ipcRenderer.invoke('select-output-file', defaultFileName),

  // ID3 operations
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

  // Chapter data management
  saveChaptersToFile: (params: { filePath: string; chapters: any[] }): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('save-chapters-to-file', params),
  loadChaptersFromFile: (filePath: string): Promise<{ success: boolean; data?: any[]; error?: string }> => 
    ipcRenderer.invoke('load-chapters-from-file', filePath),

  // Image operations
  selectImageFile: (): Promise<string | null> => ipcRenderer.invoke('select-image-file'),
  imageToBase64: (imagePath: string): Promise<{ success: boolean; data?: string; error?: string }> => 
    ipcRenderer.invoke('image-to-base64', imagePath),
  saveBase64Image: (params: { base64Data: string; outputPath: string }): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('save-base64-image', params)
});

// Type declarations have been moved to src/renderer/types/index.ts
