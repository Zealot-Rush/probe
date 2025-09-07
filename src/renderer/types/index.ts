export interface ChapterInfo {
  title: string;
  startTime: string; // 格式: "00:00:00.000"
  endTime?: string;
  image?: string; // 章节图片路径或base64数据
  imageType?: 'file' | 'extracted' | 'base64'; // 图片类型
  description?: string; // 章节描述
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
  
  // 文件操作
  selectMp3File: () => Promise<string | null>;
  selectOutputDirectory: () => Promise<string | null>;
  selectOutputFile: (defaultFileName: string) => Promise<string | null>;
  
  // ID3 操作
  checkID3Available: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getMp3Metadata: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getMp3Duration: (filePath: string) => Promise<{ success: boolean; data?: number; error?: string }>;
  extractChapters: (filePath: string) => Promise<{ success: boolean; data?: ChapterInfo[]; error?: string }>;
  addChaptersToMp3: (params: { inputPath: string; outputPath: string; chapters: ChapterInfo[] }) => Promise<{ success: boolean; error?: string }>;
  
  // 章节数据管理
  saveChaptersToFile: (params: { filePath: string; chapters: ChapterInfo[] }) => Promise<{ success: boolean; error?: string }>;
  loadChaptersFromFile: (filePath: string) => Promise<{ success: boolean; data?: ChapterInfo[]; error?: string }>;
  
  // 图片操作
  selectImageFile: () => Promise<string | null>;
  imageToBase64: (imagePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  saveBase64Image: (params: { base64Data: string; outputPath: string }) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
