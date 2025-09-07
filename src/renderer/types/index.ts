export interface ChapterInfo {
  title: string;
  startTime: string; // Format: "00:00:00.000"
  endTime?: string;
  image?: string; // Chapter image path or base64 data
  imageType?: 'file' | 'extracted' | 'base64'; // Image type
  description?: string; // Chapter description
}

export interface FFmpegProgress {
  percent: number;
  currentFrames: number;
  targetFrames: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;
  platform: string;
  versions: NodeJS.ProcessVersions;
  
  // File operations
  selectMp3File: () => Promise<string | null>;
  selectOutputDirectory: () => Promise<string | null>;
  selectOutputFile: (defaultFileName: string) => Promise<string | null>;
  
  // ID3 operations
  checkID3Available: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getMp3Metadata: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getMp3Duration: (filePath: string) => Promise<{ success: boolean; data?: number; error?: string }>;
  extractChapters: (filePath: string) => Promise<{ success: boolean; data?: ChapterInfo[]; error?: string }>;
  addChaptersToMp3: (params: { inputPath: string; outputPath: string; chapters: ChapterInfo[] }) => Promise<{ success: boolean; error?: string }>;
  
  // Chapter data management
  saveChaptersToFile: (params: { filePath: string; chapters: ChapterInfo[] }) => Promise<{ success: boolean; error?: string }>;
  loadChaptersFromFile: (filePath: string) => Promise<{ success: boolean; data?: ChapterInfo[]; error?: string }>;
  
  // Image operations
  selectImageFile: () => Promise<string | null>;
  imageToBase64: (imagePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  saveBase64Image: (params: { base64Data: string; outputPath: string }) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
