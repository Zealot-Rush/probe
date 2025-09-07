const { ID3Service } = require('./dist/id3-service.js');
const fs = require('fs');

async function testSubFramesFinal() {
  const inputPath = 'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3';
  const outputPath = 'C:\\Users\\ZackYang\\Desktop\\test_subframes_final.mp3';
  
  try {
    console.log('=== Test subFrames Chapter Image Functionality ===');
    
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
    console.log('\nStarting to add chapters with subFrames images...');
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
      
      if (chapter.image) {
        console.log('Image data length:', chapter.image.length);
        console.log('Image data start:', chapter.image.substring(0, 50) + '...');
      }
    });
    
    // Use NodeID3 to directly check raw data
    console.log('\n=== Raw ID3 Data Verification ===');
    const NodeID3 = require('node-id3');
    const rawTags = NodeID3.read(outputPath);
    
    console.log('Total chapters:', rawTags.chapter ? rawTags.chapter.length : 0);
    
    if (rawTags.chapter && rawTags.chapter.length > 0) {
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- Raw Chapter ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('Start time:', chapter.startTimeMs);
        console.log('End time:', chapter.endTimeMs);
        
        if (chapter.subFrames) {
          console.log('✅ Found subFrames structure!');
          console.log('Title:', chapter.subFrames.TIT2?.text);
          
          if (chapter.subFrames.APIC) {
            console.log('✅ Found APIC image data!');
            console.log('Image type:', chapter.subFrames.APIC.type);
            console.log('Image description:', chapter.subFrames.APIC.description);
            console.log('Image MIME type:', chapter.subFrames.APIC.mime);
            console.log('Image data size:', chapter.subFrames.APIC.data ? chapter.subFrames.APIC.data.length : 'None');
          } else {
            console.log('❌ No APIC image data');
          }
        } else {
          console.log('❌ No subFrames structure');
        }
        
        console.log('Complete chapter data:', JSON.stringify(chapter, null, 2));
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Detailed error:', error);
  }
}

testSubFramesFinal().catch(console.error);

