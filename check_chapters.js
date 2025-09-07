const NodeID3 = require('node-id3');
const path = require('path');
const fs = require('fs');

async function checkChapters() {
  const mp3Path = path.join(__dirname, 'test', 'teahour2_6.mp3');
  
  try {
    console.log('=== 检查 MP3 章节信息 ===');
    console.log('文件路径:', mp3Path);
    
    // 检查文件是否存在
    if (!fs.existsSync(mp3Path)) {
      console.error('❌ 文件不存在:', mp3Path);
      return;
    }
    
    // 获取文件大小
    const stats = fs.statSync(mp3Path);
    console.log('文件大小:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    
    // 直接使用 NodeID3 读取章节信息
    console.log('\n=== 使用 NodeID3 直接读取章节 ===');
    
    // 模拟 ID3Service 的章节解析逻辑
    function parseChapters(tags) {
      const chapters = [];
      
      if (tags.chapter && Array.isArray(tags.chapter)) {
        for (const chapter of tags.chapter) {
          // 处理 subFrames 结构
          let title = `Chapter ${chapter.elementID}`;
          let image;
          let imageType;

          if (chapter.subFrames) {
            // 从 subFrames 中获取标题
            if (chapter.subFrames.TIT2?.text) {
              title = chapter.subFrames.TIT2.text;
            }
            
            // 从 subFrames 中获取图片
            if (chapter.subFrames.APIC?.data) {
              const apic = chapter.subFrames.APIC;
              const base64Data = Buffer.from(apic.data).toString('base64');
              image = `data:${apic.mime};base64,${base64Data}`;
              imageType = 'base64';
            }
          } else if (chapter.tags) {
            // 兼容旧的 tags 结构
            title = chapter.tags.title || title;
            if (chapter.tags.image && typeof chapter.tags.image === 'string') {
              image = chapter.tags.image;
              imageType = 'base64';
            }
          }

          // 转换时间格式
          function millisecondsToTimeString(ms) {
            const totalSeconds = Math.floor(ms / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
          }

          const chapterInfo = {
            title,
            startTime: millisecondsToTimeString(chapter.startTimeMs),
            endTime: chapter.endTimeMs ? millisecondsToTimeString(chapter.endTimeMs) : undefined,
            image,
            imageType
          };
          
          chapters.push(chapterInfo);
        }
      }
      
      return chapters;
    }
    
    // 读取原始标签数据
    const rawTags = NodeID3.read(mp3Path);
    
    console.log('所有标签键:', Object.keys(rawTags));
    
    // 解析章节
    const chapters = parseChapters(rawTags);
    console.log('解析后的章节数量:', chapters.length);
    
    if (chapters.length > 0) {
      console.log('\n--- 解析后的章节详情 ---');
      chapters.forEach((chapter, index) => {
        console.log(`\n章节 ${index + 1}:`);
        console.log('  标题:', chapter.title);
        console.log('  开始时间:', chapter.startTime);
        console.log('  结束时间:', chapter.endTime || '未设置');
        console.log('  图片:', chapter.image ? '有' : '无');
        console.log('  图片类型:', chapter.imageType || '无');
      });
    } else {
      console.log('❌ 未找到章节信息');
    }
    
    if (rawTags.chapter && Array.isArray(rawTags.chapter)) {
      console.log('\n原始章节数据:');
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- 原始章节 ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('startTimeMs:', chapter.startTimeMs);
        console.log('endTimeMs:', chapter.endTimeMs);
        console.log('startOffset:', chapter.startOffset);
        console.log('endOffset:', chapter.endOffset);
        
        if (chapter.subFrames) {
          console.log('subFrames 结构:');
          console.log('  TIT2 (标题):', chapter.subFrames.TIT2);
          console.log('  APIC (图片):', chapter.subFrames.APIC ? '有图片数据' : '无图片');
          if (chapter.subFrames.APIC) {
            console.log('    图片MIME类型:', chapter.subFrames.APIC.mime);
            console.log('    图片类型:', chapter.subFrames.APIC.type);
            console.log('    图片描述:', chapter.subFrames.APIC.description);
            console.log('    图片数据大小:', chapter.subFrames.APIC.data ? chapter.subFrames.APIC.data.length : '无');
          }
        }
        
        if (chapter.tags) {
          console.log('tags 结构:', chapter.tags);
        }
        
        console.log('完整章节对象:', JSON.stringify(chapter, null, 2));
      });
    } else {
      console.log('❌ 未找到原始章节数据');
    }
    
    // 检查其他相关标签
    console.log('\n=== 其他标签信息 ===');
    console.log('标题:', rawTags.title || '无');
    console.log('艺术家:', rawTags.artist || '无');
    console.log('专辑:', rawTags.album || '无');
    console.log('年份:', rawTags.year || '无');
    console.log('流派:', rawTags.genre || '无');
    console.log('评论:', rawTags.comment || '无');
    
    // 检查全局图片
    if (rawTags.image) {
      console.log('\n=== 全局图片信息 ===');
      console.log('图片类型:', rawTags.image.type);
      console.log('图片描述:', rawTags.image.description);
      console.log('图片MIME类型:', rawTags.image.mimeType);
      console.log('图片数据大小:', rawTags.image.data ? rawTags.image.data.length : '无');
    } else {
      console.log('\n❌ 无全局图片');
    }
    
    // 检查CTOC (Table of Contents)
    if (rawTags.tableOfContents) {
      console.log('\n=== 目录表 (CTOC) ===');
      console.log('CTOC数量:', rawTags.tableOfContents.length);
      rawTags.tableOfContents.forEach((ctoc, index) => {
        console.log(`CTOC ${index + 1}:`, ctoc);
      });
    } else {
      console.log('\n❌ 无目录表');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('详细错误:', error);
  }
}

checkChapters().catch(console.error);
