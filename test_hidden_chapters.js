import { ID3Service } from './dist/id3-service.js';
import fs from 'fs';

async function testHiddenChapters() {
  const inputPath = 'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3';
  const outputPath = 'C:\\Users\\ZackYang\\Desktop\\test_hidden_chapters.mp3';
  
  try {
    console.log('=== Test Hidden Chapter Image Functionality ===');
    
    const id3Service = ID3Service.getInstance();
    
    // Create test chapter data with images
    const testChapters = [
      {
        title: 'Test Chapter 1',
        startTime: '00:00:00.000',
        endTime: '00:01:00.000',
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        imageType: 'base64'
      },
      {
        title: 'Test Chapter 2',
        startTime: '00:01:00.000',
        endTime: '00:02:00.000',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        imageType: 'base64'
      }
    ];
    
    console.log('Test chapter data:', JSON.stringify(testChapters, null, 2));
    
    // Add chapters to new file
    console.log('\nStarting to add chapters with hidden images...');
    await id3Service.addChaptersToMp3(inputPath, outputPath, testChapters);
    console.log('✅ Chapter addition completed');
    
    // Verify results
    console.log('\n=== Verification Results ===');
    const chapters = await id3Service.readChaptersFromMp3(outputPath);
    
    chapters.forEach((chapter, index) => {
      console.log(`\n--- Chapter ${index + 1} ---`);
      console.log('Title:', chapter.title);
      console.log('Start time:', chapter.startTime);
      console.log('End time:', chapter.endTime);
      console.log('Image:', chapter.image ? 'Yes' : 'No');
      console.log('Image type:', chapter.imageType);
    });
    
    // Use NodeID3 to directly check raw data
    console.log('\n=== Raw ID3 Data Verification ===');
    const NodeID3 = (await import('node-id3')).default;
    const rawTags = NodeID3.read(outputPath);
    
    console.log('Total chapters:', rawTags.chapter ? rawTags.chapter.length : 0);
    
    if (rawTags.chapter && rawTags.chapter.length > 0) {
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- Raw Chapter ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('Title:', chapter.tags?.title);
        console.log('Start time:', chapter.startTimeMs);
        console.log('End time:', chapter.endTimeMs);
        
        if (chapter.tags && chapter.tags.APIC) {
          console.log('✅ Found APIC image data!');
          console.log('Image type:', chapter.tags.APIC.type);
          console.log('Image description:', chapter.tags.APIC.description);
          console.log('Image MIME type:', chapter.tags.APIC.mimeType);
          console.log('Image data size:', chapter.tags.APIC.data ? chapter.tags.APIC.data.length : 'None');
        } else {
          console.log('❌ No APIC image data');
        }
        
        console.log('Complete tags:', JSON.stringify(chapter.tags, null, 2));
      });
    }
    
    // Check global image
    console.log('\n=== Global Image Check ===');
    console.log('Global image:', rawTags.image ? 'Yes' : 'No');
    if (rawTags.image) {
      console.log('Image type:', rawTags.image.type);
      console.log('Image description:', rawTags.image.description);
      console.log('Image MIME type:', rawTags.image.mimeType);
      console.log('Image data size:', rawTags.image.data ? rawTags.image.data.length : 'None');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Detailed error:', error);
  }
}

testHiddenChapters().catch(console.error);

