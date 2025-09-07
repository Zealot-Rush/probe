import NodeID3 from 'node-id3';
import * as fs from 'fs';
import * as path from 'path';

export interface ChapterInfo {
  title: string;
  startTime: string; // 格式: "00:00:00.000"
  endTime?: string;
  image?: string; // 章节图片路径或base64数据
  imageType?: 'file' | 'extracted' | 'base64'; // 图片类型
  description?: string; // 章节描述
}

export interface ID3Chapter {
  elementID: string;
  startTimeMs: number;
  endTimeMs: number;
  tags: {
    title: string;
    [key: string]: any;
  };
}

export class ID3Service {
  private static instance: ID3Service;
  
  private constructor() {}

  public static getInstance(): ID3Service {
    if (!ID3Service.instance) {
      ID3Service.instance = new ID3Service();
    }
    return ID3Service.instance;
  }

  /**
   * 读取MP3文件的章节信息
   */
  public async readChaptersFromMp3(filePath: string): Promise<ChapterInfo[]> {
    try {
      console.log('ID3服务: 开始读取MP3章节信息', { filePath });
      
      const tags = NodeID3.read(filePath);
      console.log('ID3服务: 读取到的标签', { tags });
      
      const chapters: ChapterInfo[] = [];
      
      if (tags.chapter && Array.isArray(tags.chapter)) {
        for (const chapter of tags.chapter) {
          // 处理 tags 结构
          let title = `Chapter ${chapter.elementID}`;
          let image: string | undefined;
          let imageType: 'file' | 'extracted' | 'base64' | undefined;

          if (chapter.tags) {
            // 从 tags 中获取标题
            title = chapter.tags.title || title;
            
            // 从 tags 中获取图片
            if (chapter.tags.image) {
              if (typeof chapter.tags.image === 'object' && 'imageBuffer' in chapter.tags.image && Buffer.isBuffer(chapter.tags.image.imageBuffer)) {
                // 处理 imageBuffer 格式
                const base64Data = chapter.tags.image.imageBuffer.toString('base64');
                const mimeType = chapter.tags.image.mime || 'image/jpeg';
                image = `data:${mimeType};base64,${base64Data}`;
                imageType = 'base64';
              } else if (typeof chapter.tags.image === 'string') {
                // 处理字符串格式的图片
                image = chapter.tags.image;
                imageType = 'base64';
              }
            }
          } else if ((chapter as any).subFrames) {
            // 兼容旧的 subFrames 结构
            if ((chapter as any).subFrames.TIT2?.text) {
              title = (chapter as any).subFrames.TIT2.text;
            }
            
            if ((chapter as any).subFrames.APIC?.data) {
              const apic = (chapter as any).subFrames.APIC;
              const base64Data = Buffer.from(apic.data).toString('base64');
              image = `data:${apic.mime};base64,${base64Data}`;
              imageType = 'base64';
            }
          }

          const chapterInfo: ChapterInfo = {
            title,
            startTime: this.millisecondsToTimeString(chapter.startTimeMs),
            endTime: chapter.endTimeMs ? this.millisecondsToTimeString(chapter.endTimeMs) : undefined,
            image,
            imageType
          };
          
          chapters.push(chapterInfo);
        }
      }
      
      console.log('ID3服务: 提取到的章节', chapters);
      return chapters;
    } catch (error) {
      console.error('ID3服务: 读取章节失败', error);
      throw error;
    }
  }

  /**
   * 为MP3文件添加章节信息
   */
  public async addChaptersToMp3(
    inputPath: string,
    outputPath: string,
    chapters: ChapterInfo[]
  ): Promise<void> {
    try {
      console.log('ID3服务: 开始添加章节到MP3', {
        inputPath,
        outputPath,
        chaptersCount: chapters.length
      });

      // 读取现有的标签
      const existingTags = NodeID3.read(inputPath) || {};
      console.log('ID3服务: 现有标签', existingTags);

      // 转换章节格式 - 使用 tags 结构支持图片
      const id3Chapters: any[] = chapters.map((chapter, index) => {
        const startTimeMs = this.timeStringToMilliseconds(chapter.startTime);
        let endTimeMs = startTimeMs + 60000; // 默认1分钟

        if (chapter.endTime) {
          endTimeMs = this.timeStringToMilliseconds(chapter.endTime);
        } else if (index < chapters.length - 1) {
          // 使用下一个章节的开始时间
          endTimeMs = this.timeStringToMilliseconds(chapters[index + 1].startTime);
        }

        // 构建 tags 结构
        const tags: any = {
          title: chapter.title
        };

        // 如果有图片，添加图片数据到 tags.image
        if (chapter.image) {
          let imageData: Buffer | undefined;
          let mimeType = 'image/jpeg';

          if (chapter.imageType === 'base64' || chapter.image.startsWith('data:')) {
            // 处理base64数据
            let base64Data = chapter.image;
            if (chapter.image.startsWith('data:')) {
              const [header, data] = chapter.image.split(',');
              const mimeMatch = header.match(/data:([^;]+)/);
              if (mimeMatch) {
                mimeType = mimeMatch[1];
              }
              base64Data = data;
            }
            imageData = Buffer.from(base64Data, 'base64');
          } else if (chapter.imageType === 'file' && fs.existsSync(chapter.image)) {
            // 读取图片文件
            imageData = fs.readFileSync(chapter.image);
            // 根据文件扩展名判断MIME类型
            const ext = chapter.image.toLowerCase().split('.').pop();
            if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'gif') mimeType = 'image/gif';
            else mimeType = 'image/jpeg';
          }

          if (imageData) {
            tags.image = {
              mime: mimeType,
              type: { id: 0, name: 'other' }, // 0 = Other
              description: `Chapter ${index + 1}: ${chapter.title}`,
              imageBuffer: imageData
            };
          }
        }

        return {
          elementID: `chp${index}`,
          startTimeMs,
          endTimeMs,
          tags
        };
      });

      console.log('ID3服务: 转换后的ID3章节', id3Chapters);

      // 创建CTOC帧（目录表）
      const ctocFrame = {
        elementID: 'toc',
        flags: {
          topLevel: true,
          ordered: true
        },
        childElementIDs: id3Chapters.map(chapter => chapter.elementID),
        tags: {
          title: 'Table of Contents'
        }
      };

      // 创建新的标签对象
      const newTags = {
        ...existingTags,
        chapter: id3Chapters, // 使用新的 tags 结构
        tableOfContents: [ctocFrame], // 添加CTOC帧
        // 添加一些全局标签以提高兼容性
        title: existingTags.title || 'Audio with Chapters',
        artist: existingTags.artist || 'Chapter Manager',
        album: existingTags.album || 'Chapters',
        genre: existingTags.genre || 'Podcast',
        year: existingTags.year || new Date().getFullYear().toString(),
        comment: existingTags.comment || { language: 'eng', text: `Contains ${chapters.length} chapters` },
      };

      // 复制输入文件到输出路径
      fs.copyFileSync(inputPath, outputPath);
      
      // 写入标签到新文件
      const success = NodeID3.write(newTags, outputPath);
      
      if (success) {
        console.log('ID3服务: 章节添加成功');
      } else {
        throw new Error('写入ID3标签失败');
      }
    } catch (error) {
      console.error('ID3服务: 添加章节失败', error);
      throw error;
    }
  }

  /**
   * 获取MP3文件的时长
   */
  public async getMp3Duration(filePath: string): Promise<number> {
    try {
      // 使用ffprobe获取时长，因为node-id3不直接提供时长信息
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const command = `ffprobe -v quiet -print_format json -show_format "${filePath}"`;
      const { stdout } = await execAsync(command);
      const metadata = JSON.parse(stdout);
      
      return parseFloat(metadata.format.duration) || 0;
    } catch (error) {
      console.error('ID3服务: 获取时长失败', error);
      throw error;
    }
  }

  /**
   * 获取MP3文件的元数据信息
   */
  public async getMetadata(filePath: string): Promise<any> {
    try {
      const tags = NodeID3.read(filePath);
      return { format: { duration: await this.getMp3Duration(filePath) }, chapters: tags.chapter || [] };
    } catch (error) {
      console.error('ID3服务: 获取元数据失败', error);
      throw error;
    }
  }

  /**
   * 从MP3文件中提取章节信息
   */
  public async extractChaptersFromMp3(filePath: string): Promise<ChapterInfo[]> {
    return await this.readChaptersFromMp3(filePath);
  }

  /**
   * 将时间字符串转换为毫秒
   */
  private timeStringToMilliseconds(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  /**
   * 将毫秒转换为时间字符串
   */
  private millisecondsToTimeString(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
  }

  /**
   * 检查node-id3是否可用
   */
  public async checkID3Available(): Promise<boolean> {
    try {
      // 简单的测试来检查库是否正常工作
      return typeof NodeID3.read === 'function' && typeof NodeID3.write === 'function';
    } catch (error) {
      console.error('ID3服务: 检查可用性失败', error);
      return false;
    }
  }
}
