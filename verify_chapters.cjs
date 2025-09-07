const NodeID3 = require('node-id3');
const path = require('path');

async function verifyChapters() {
  const mp3Path = path.join(__dirname, 'test', 'nochapter_with_chapters.mp3');
  
  try {
    console.log('=== Verifying Generated MP3 Chapter Information ===');
    console.log('File path:', mp3Path);
    
    const rawTags = NodeID3.read(mp3Path);
    
    console.log('\n=== All Tag Keys ===');
    console.log('Tag keys:', Object.keys(rawTags));
    
    // Check chapter data
    if (rawTags.chapter && Array.isArray(rawTags.chapter)) {
      console.log('\n=== Chapter Details ===');
      console.log('Total chapters:', rawTags.chapter.length);
      
      rawTags.chapter.forEach((chapter, index) => {
        console.log(`\n--- Chapter ${index + 1} ---`);
        console.log('elementID:', chapter.elementID);
        console.log('startTimeMs:', chapter.startTimeMs);
        console.log('endTimeMs:', chapter.endTimeMs);
        
        if (chapter.tags) {
          console.log('Title:', chapter.tags.title);
          if (chapter.tags.image) {
            console.log('✅ Found image data!');
            console.log('MIME type:', chapter.tags.image.mime);
            console.log('Image type:', chapter.tags.image.type);
            console.log('Image description:', chapter.tags.image.description);
            console.log('Image data size:', chapter.tags.image.imageBuffer ? chapter.tags.image.imageBuffer.length : 'None');
          } else {
            console.log('❌ No image data');
          }
        }
      });
    } else {
      console.log('\n❌ No chapter data found');
    }
    
    // Check CTOC
    if (rawTags.tableOfContents) {
      console.log('\n=== Table of Contents (CTOC) ===');
      console.log('CTOC count:', rawTags.tableOfContents.length);
      rawTags.tableOfContents.forEach((ctoc, index) => {
        console.log(`CTOC ${index + 1}:`, {
          elementID: ctoc.elementID,
          isOrdered: ctoc.isOrdered,
          childElementIDs: ctoc.childElementIDs
        });
      });
    }
    
    // Check other tags
    console.log('\n=== Other Tag Information ===');
    console.log('Title:', rawTags.title || 'None');
    console.log('Artist:', rawTags.artist || 'None');
    console.log('Album:', rawTags.album || 'None');
    console.log('Year:', rawTags.year || 'None');
    console.log('Genre:', rawTags.genre || 'None');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Detailed error:', error);
  }
}

verifyChapters().catch(console.error);
