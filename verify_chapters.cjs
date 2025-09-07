const NodeID3 = require('node-id3');
const path = require('path');

async function verifyChapters() {
  const mp3Path = path.join(__dirname, 'test', 'nochapter_with_chapters.mp3');
  
  try {
    console.log('=== 验证生成的MP3章节信息 ===');
    console.log('文件路径:', mp3Path);
    
    const rawTags = NodeID3.read(mp3Path);
    
    console.log('\n=== 所有标签键 ===');
    console.log('标签键:', Object.keys(rawTags));
    
    // 检查章节数据
    if (rawTags.chapter && Array.isArray(rawTags.chapter)) {
      console.log('\n=== 章节详细信息 ===');
      console.log('章节总数:', rawTags.chapter.length);
      
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- 章节 ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('startTimeMs:', chapter.startTimeMs);
        console.log('endTimeMs:', chapter.endTimeMs);
        
        if (chapter.tags) {
          console.log('标题:', chapter.tags.title);
          if (chapter.tags.image) {
            console.log('✅ 发现图片数据!');
            console.log('MIME类型:', chapter.tags.image.mime);
            console.log('图片类型:', chapter.tags.image.type);
            console.log('图片描述:', chapter.tags.image.description);
            console.log('图片数据大小:', chapter.tags.image.imageBuffer ? chapter.tags.image.imageBuffer.length : '无');
          } else {
            console.log('❌ 没有图片数据');
          }
        }
      });
    } else {
      console.log('\n❌ 未找到章节数据');
    }
    
    // 检查CTOC
    if (rawTags.tableOfContents) {
      console.log('\n=== 目录表 (CTOC) ===');
      console.log('CTOC数量:', rawTags.tableOfContents.length);
      rawTags.tableOfContents.forEach((ctoc, index) => {
        console.log(`CTOC ${index + 1}:`, {
          elementID: ctoc.elementID,
          isOrdered: ctoc.isOrdered,
          childElementIDs: ctoc.childElementIDs
        });
      });
    }
    
    // 检查其他标签
    console.log('\n=== 其他标签信息 ===');
    console.log('标题:', rawTags.title || '无');
    console.log('艺术家:', rawTags.artist || '无');
    console.log('专辑:', rawTags.album || '无');
    console.log('年份:', rawTags.year || '无');
    console.log('流派:', rawTags.genre || '无');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    console.error('详细错误:', error);
  }
}

verifyChapters().catch(console.error);
