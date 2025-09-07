const { ID3Service } = require('./dist/id3-service.js');
const fs = require('fs');

async function testSubFramesFinal() {
  const inputPath = 'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3';
  const outputPath = 'C:\\Users\\ZackYang\\Desktop\\test_subframes_final.mp3';
  
  try {
    console.log('=== 测试 subFrames 章节图片功能 ===');
    
    const id3Service = ID3Service.getInstance();
    
    // 创建测试章节数据，包含图片
    const testChapters = [
      {
        title: '测试章节 1',
        startTime: '00:00:00.000',
        endTime: '00:01:00.000',
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        imageType: 'base64'
      },
      {
        title: '测试章节 2',
        startTime: '00:01:00.000',
        endTime: '00:02:00.000',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        imageType: 'base64'
      }
    ];
    
    console.log('测试章节数据:', JSON.stringify(testChapters, null, 2));
    
    // 添加章节到新文件
    console.log('\n开始添加带 subFrames 图片章节的章节...');
    await id3Service.addChaptersToMp3(inputPath, outputPath, testChapters);
    console.log('✅ 章节添加完成');
    
    // 验证结果
    console.log('\n=== 验证结果 ===');
    const chapters = await id3Service.readChaptersFromMp3(outputPath);
    
    chapters.forEach((chapter, index) => {
      console.log(`\n--- 章节 ${index + 1} ---`);
      console.log('标题:', chapter.title);
      console.log('开始时间:', chapter.startTime);
      console.log('结束时间:', chapter.endTime);
      console.log('图片:', chapter.image ? '有' : '无');
      console.log('图片类型:', chapter.imageType);
      
      if (chapter.image) {
        console.log('图片数据长度:', chapter.image.length);
        console.log('图片数据开头:', chapter.image.substring(0, 50) + '...');
      }
    });
    
    // 使用NodeID3直接检查原始数据
    console.log('\n=== 原始ID3数据验证 ===');
    const NodeID3 = require('node-id3');
    const rawTags = NodeID3.read(outputPath);
    
    console.log('总章节数:', rawTags.chapter ? rawTags.chapter.length : 0);
    
    if (rawTags.chapter && rawTags.chapter.length > 0) {
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- 原始章节 ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('开始时间:', chapter.startTimeMs);
        console.log('结束时间:', chapter.endTimeMs);
        
        if (chapter.subFrames) {
          console.log('✅ 发现 subFrames 结构!');
          console.log('标题:', chapter.subFrames.TIT2?.text);
          
          if (chapter.subFrames.APIC) {
            console.log('✅ 发现 APIC 图片数据!');
            console.log('图片类型:', chapter.subFrames.APIC.type);
            console.log('图片描述:', chapter.subFrames.APIC.description);
            console.log('图片MIME类型:', chapter.subFrames.APIC.mime);
            console.log('图片数据大小:', chapter.subFrames.APIC.data ? chapter.subFrames.APIC.data.length : '无');
          } else {
            console.log('❌ 没有 APIC 图片数据');
          }
        } else {
          console.log('❌ 没有 subFrames 结构');
        }
        
        console.log('完整章节数据:', JSON.stringify(chapter, null, 2));
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testSubFramesFinal().catch(console.error);

