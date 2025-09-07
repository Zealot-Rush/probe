import { ID3Service } from './dist/id3-service.js';
import fs from 'fs';

async function testHiddenChapters() {
  const inputPath = 'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3';
  const outputPath = 'C:\\Users\\ZackYang\\Desktop\\test_hidden_chapters.mp3';
  
  try {
    console.log('=== 测试隐藏章节图片功能 ===');
    
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
    console.log('\n开始添加带隐藏图片章节的章节...');
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
    });
    
    // 使用NodeID3直接检查原始数据
    console.log('\n=== 原始ID3数据验证 ===');
    const NodeID3 = (await import('node-id3')).default;
    const rawTags = NodeID3.read(outputPath);
    
    console.log('总章节数:', rawTags.chapter ? rawTags.chapter.length : 0);
    
    if (rawTags.chapter && rawTags.chapter.length > 0) {
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- 原始章节 ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('标题:', chapter.tags?.title);
        console.log('开始时间:', chapter.startTimeMs);
        console.log('结束时间:', chapter.endTimeMs);
        
        if (chapter.tags && chapter.tags.APIC) {
          console.log('✅ 发现APIC图片数据!');
          console.log('图片类型:', chapter.tags.APIC.type);
          console.log('图片描述:', chapter.tags.APIC.description);
          console.log('图片MIME类型:', chapter.tags.APIC.mimeType);
          console.log('图片数据大小:', chapter.tags.APIC.data ? chapter.tags.APIC.data.length : '无');
        } else {
          console.log('❌ 没有APIC图片数据');
        }
        
        console.log('完整tags:', JSON.stringify(chapter.tags, null, 2));
      });
    }
    
    // 检查全局图片
    console.log('\n=== 全局图片检查 ===');
    console.log('全局图片:', rawTags.image ? '有' : '无');
    if (rawTags.image) {
      console.log('图片类型:', rawTags.image.type);
      console.log('图片描述:', rawTags.image.description);
      console.log('图片MIME类型:', rawTags.image.mimeType);
      console.log('图片数据大小:', rawTags.image.data ? rawTags.image.data.length : '无');
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testHiddenChapters().catch(console.error);

