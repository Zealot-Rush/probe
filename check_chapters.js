const NodeID3 = require('node-id3');
const path = require('path');
const fs = require('fs');

async function checkChapters() {
  const mp3Path = path.join(__dirname, 'test', 'teahour2_6.mp3');
  
  try {
    console.log('=== Check MP3 Chapter Information ===');
    console.log('File path:', mp3Path);
    
    // Check if file exists
    if (!fs.existsSync(mp3Path)) {
      console.error('❌ File does not exist:', mp3Path);
      return;
    }
    
    // Get file size
    const stats = fs.statSync(mp3Path);
    console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Directly use NodeID3 to read chapter information
    console.log('\n=== Using NodeID3 to Read Chapters Directly ===');
    
    // Simulate ID3Service chapter parsing logic
    function parseChapters(tags) {
      const chapters = [];
      
      if (tags.chapter && Array.isArray(tags.chapter)) {
        for (const chapter of tags.chapter) {
          // Handle subFrames structure
          let title = `Chapter ${chapter.elementID}`;
          let image;
          let imageType;

          if (chapter.subFrames) {
            // Get title from subFrames
            if (chapter.subFrames.TIT2?.text) {
              title = chapter.subFrames.TIT2.text;
            }
            
            // Get image from subFrames
            if (chapter.subFrames.APIC?.data) {
              const apic = chapter.subFrames.APIC;
              const base64Data = Buffer.from(apic.data).toString('base64');
              image = `data:${apic.mime};base64,${base64Data}`;
              imageType = 'base64';
            }
          } else if (chapter.tags) {
            // Compatible with old tags structure
            title = chapter.tags.title || title;
            if (chapter.tags.image && typeof chapter.tags.image === 'string') {
              image = chapter.tags.image;
              imageType = 'base64';
            }
          }

          // Convert time format
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
    
    // Read raw tag data
    const rawTags = NodeID3.read(mp3Path);
    
    console.log('All tag keys:', Object.keys(rawTags));
    
    // Parse chapters
    const chapters = parseChapters(rawTags);
    console.log('Parsed chapter count:', chapters.length);
    
    if (chapters.length > 0) {
      console.log('\n--- Parsed Chapter Details ---');
      chapters.forEach((chapter, index) => {
        console.log(`\nChapter ${index + 1}:`);
        console.log('  Title:', chapter.title);
        console.log('  Start time:', chapter.startTime);
        console.log('  End time:', chapter.endTime || 'Not set');
        console.log('  Image:', chapter.image ? 'Yes' : 'No');
        console.log('  Image type:', chapter.imageType || 'None');
      });
    } else {
      console.log('❌ No chapter information found');
    }
    
    if (rawTags.chapter && Array.isArray(rawTags.chapter)) {
      console.log('\nRaw chapter data:');
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- Raw Chapter ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('startTimeMs:', chapter.startTimeMs);
        console.log('endTimeMs:', chapter.endTimeMs);
        console.log('startOffset:', chapter.startOffset);
        console.log('endOffset:', chapter.endOffset);
        
        if (chapter.subFrames) {
          console.log('subFrames structure:');
          console.log('  TIT2 (title):', chapter.subFrames.TIT2);
          console.log('  APIC (image):', chapter.subFrames.APIC ? 'Has image data' : 'No image');
          if (chapter.subFrames.APIC) {
            console.log('    Image MIME type:', chapter.subFrames.APIC.mime);
            console.log('    Image type:', chapter.subFrames.APIC.type);
            console.log('    Image description:', chapter.subFrames.APIC.description);
            console.log('    Image data size:', chapter.subFrames.APIC.data ? chapter.subFrames.APIC.data.length : 'None');
          }
        }
        
        if (chapter.tags) {
          console.log('tags structure:', chapter.tags);
        }
        
        console.log('Complete chapter object:', JSON.stringify(chapter, null, 2));
      });
    } else {
      console.log('❌ No raw chapter data found');
    }
    
    // Check other related tags
    console.log('\n=== Other Tag Information ===');
    console.log('Title:', rawTags.title || 'None');
    console.log('Artist:', rawTags.artist || 'None');
    console.log('Album:', rawTags.album || 'None');
    console.log('Year:', rawTags.year || 'None');
    console.log('Genre:', rawTags.genre || 'None');
    console.log('Comment:', rawTags.comment || 'None');
    
    // Check global image
    if (rawTags.image) {
      console.log('\n=== Global Image Information ===');
      console.log('Image type:', rawTags.image.type);
      console.log('Image description:', rawTags.image.description);
      console.log('Image MIME type:', rawTags.image.mimeType);
      console.log('Image data size:', rawTags.image.data ? rawTags.image.data.length : 'None');
    } else {
      console.log('\n❌ No global image');
    }
    
    // Check CTOC (Table of Contents)
    if (rawTags.tableOfContents) {
      console.log('\n=== Table of Contents (CTOC) ===');
      console.log('CTOC count:', rawTags.tableOfContents.length);
      rawTags.tableOfContents.forEach((ctoc, index) => {
        console.log(`CTOC ${index + 1}:`, ctoc);
      });
    } else {
      console.log('\n❌ No table of contents');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.error('Detailed error:', error);
  }
}

checkChapters().catch(console.error);
