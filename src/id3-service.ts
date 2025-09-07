import NodeID3 from 'node-id3';
import * as fs from 'fs';
import * as path from 'path';

export interface ChapterInfo {
  title: string;
  startTime: string; // Format: "00:00:00.000"
  endTime?: string;
  image?: string; // Chapter image path or base64 data
  imageType?: 'file' | 'extracted' | 'base64'; // Image type
  description?: string; // Chapter description
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
   * Read chapter information from MP3 file
   */
  public async readChaptersFromMp3(filePath: string): Promise<ChapterInfo[]> {
    try {
      console.log('ID3 Service: Starting to read MP3 chapter information', { filePath });
      
      const tags = NodeID3.read(filePath);
      console.log('ID3 Service: Read tags', { tags });
      
      const chapters: ChapterInfo[] = [];
      
      if (tags.chapter && Array.isArray(tags.chapter)) {
        for (const chapter of tags.chapter) {
          // Handle tags structure
          let title = `Chapter ${chapter.elementID}`;
          let image: string | undefined;
          let imageType: 'file' | 'extracted' | 'base64' | undefined;

          if (chapter.tags) {
            // Get title from tags
            title = chapter.tags.title || title;
            
            // Get image from tags
            if (chapter.tags.image) {
              if (typeof chapter.tags.image === 'object' && 'imageBuffer' in chapter.tags.image && Buffer.isBuffer(chapter.tags.image.imageBuffer)) {
                // Handle imageBuffer format
                const base64Data = chapter.tags.image.imageBuffer.toString('base64');
                const mimeType = chapter.tags.image.mime || 'image/jpeg';
                image = `data:${mimeType};base64,${base64Data}`;
                imageType = 'base64';
              } else if (typeof chapter.tags.image === 'string') {
                // Handle string format image
                image = chapter.tags.image;
                imageType = 'base64';
              }
            }
          } else if ((chapter as any).subFrames) {
            // Compatible with old subFrames structure
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
      
      console.log('ID3 Service: Extracted chapters', chapters);
      return chapters;
    } catch (error) {
      console.error('ID3 Service: Failed to read chapters', error);
      throw error;
    }
  }

  /**
   * Add chapter information to MP3 file
   */
  public async addChaptersToMp3(
    inputPath: string,
    outputPath: string,
    chapters: ChapterInfo[]
  ): Promise<void> {
    try {
      console.log('ID3 Service: Starting to add chapters to MP3', {
        inputPath,
        outputPath,
        chaptersCount: chapters.length
      });

      // Read existing tags
      const existingTags = NodeID3.read(inputPath) || {};
      console.log('ID3 Service: Existing tags', existingTags);

      // Convert chapter format - use tags structure to support images
      const id3Chapters: any[] = chapters.map((chapter, index) => {
        const startTimeMs = this.timeStringToMilliseconds(chapter.startTime);
        let endTimeMs = startTimeMs + 60000; // Default 1 minute

        if (chapter.endTime) {
          endTimeMs = this.timeStringToMilliseconds(chapter.endTime);
        } else if (index < chapters.length - 1) {
          // Use next chapter's start time
          endTimeMs = this.timeStringToMilliseconds(chapters[index + 1].startTime);
        }

        // Build tags structure
        const tags: any = {
          title: chapter.title
        };

        // If there's an image, add image data to tags.image
        if (chapter.image) {
          let imageData: Buffer | undefined;
          let mimeType = 'image/jpeg';

          if (chapter.imageType === 'base64' || chapter.image.startsWith('data:')) {
            // Handle base64 data
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
            // Read image file
            imageData = fs.readFileSync(chapter.image);
            // Determine MIME type based on file extension
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

      console.log('ID3 Service: Converted ID3 chapters', id3Chapters);

      // Create CTOC frame (Table of Contents)
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

      // Create new tags object
      const newTags = {
        ...existingTags,
        chapter: id3Chapters, // Use new tags structure
        tableOfContents: [ctocFrame], // Add CTOC frame
        // Add some global tags for better compatibility
        title: existingTags.title || 'Audio with Chapters',
        artist: existingTags.artist || 'Chapter Manager',
        album: existingTags.album || 'Chapters',
        genre: existingTags.genre || 'Podcast',
        year: existingTags.year || new Date().getFullYear().toString(),
        comment: existingTags.comment || { language: 'eng', text: `Contains ${chapters.length} chapters` },
      };

      // Copy input file to output path
      fs.copyFileSync(inputPath, outputPath);
      
      // Write tags to new file
      const success = NodeID3.write(newTags, outputPath);
      
      if (success) {
        console.log('ID3 Service: Chapters added successfully');
      } else {
        throw new Error('Failed to write ID3 tags');
      }
    } catch (error) {
      console.error('ID3 Service: Failed to add chapters', error);
      throw error;
    }
  }

  /**
   * Get MP3 file duration
   */
  public async getMp3Duration(filePath: string): Promise<number> {
    try {
      // Use ffprobe to get duration, as node-id3 doesn't directly provide duration information
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const command = `ffprobe -v quiet -print_format json -show_format "${filePath}"`;
      const { stdout } = await execAsync(command);
      const metadata = JSON.parse(stdout);
      
      return parseFloat(metadata.format.duration) || 0;
    } catch (error) {
      console.error('ID3 Service: Failed to get duration', error);
      throw error;
    }
  }

  /**
   * Get MP3 file metadata information
   */
  public async getMetadata(filePath: string): Promise<any> {
    try {
      const tags = NodeID3.read(filePath);
      return { format: { duration: await this.getMp3Duration(filePath) }, chapters: tags.chapter || [] };
    } catch (error) {
      console.error('ID3 Service: Failed to get metadata', error);
      throw error;
    }
  }

  /**
   * Extract chapter information from MP3 file
   */
  public async extractChaptersFromMp3(filePath: string): Promise<ChapterInfo[]> {
    return await this.readChaptersFromMp3(filePath);
  }

  /**
   * Convert time string to milliseconds
   */
  private timeStringToMilliseconds(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  /**
   * Convert milliseconds to time string
   */
  private millisecondsToTimeString(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
  }

  /**
   * Check if node-id3 is available
   */
  public async checkID3Available(): Promise<boolean> {
    try {
      // Simple test to check if the library is working properly
      return typeof NodeID3.read === 'function' && typeof NodeID3.write === 'function';
    } catch (error) {
      console.error('ID3 Service: Failed to check availability', error);
      return false;
    }
  }
}
