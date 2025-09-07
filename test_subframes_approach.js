const NodeID3 = require('node-id3');
const fs = require('fs');
const { promisify } = require('util');

// Convert fs.readFile to Promise to support async/await
const readFileAsync = promisify(fs.readFile);

// Define types for chapters and images (JavaScript objects)
// Chapter object structure:
// {
//   elementID: string,
//   startTimeMs: number,
//   endTimeMs: number,
//   startOffset: number,
//   endOffset: number,
//   subFrames: {
//     TIT2?: { text: string },
//     APIC?: NodeID3.Tags['image']
//   }
// }

// Async function: Add chapters and images to MP3 file
async function addChapterWithImage(
  mp3Path,
  imagePath,
  chapter
) {
  try {
    // Read MP3 file
    const mp3Buffer = await readFileAsync(mp3Path);

    // Read image file
    const imageBuffer = await readFileAsync(imagePath);

    // Create ID3 tags object
    const tags = {
      chapter: [
        {
          elementID: chapter.elementID,
          startTimeMs: chapter.startTimeMs,
          endTimeMs: chapter.endTimeMs,
          startOffset: chapter.startOffset,
          endOffset: chapter.endOffset,
          subFrames: {
            // Chapter title
            TIT2: { text: chapter.subFrames.TIT2?.text || '' },
            // Chapter image
            APIC: {
              mime: 'image/png', // MIME type, recommend using PNG or JPEG
              type: { id: 0, name: 'other' }, // Image type, 0 means general type
              description: 'Chapter Image', // Image description
              data: imageBuffer, // Image binary data
            },
          },
        },
      ],
    };

    console.log('Created tags:', JSON.stringify(tags, null, 2));

    // Write ID3 tags to MP3 file
    const success = NodeID3.write(tags, mp3Buffer);

    if (success) {
      console.log('Successfully added chapters and images!');
      return true;
    } else {
      console.error('Failed to write ID3 tags');
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Test function
async function testSubFramesApproach() {
  try {
    // Create a small test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    // Save test image
    fs.writeFileSync('test_image.png', testImageBuffer);
    
    const chapter = {
      elementID: 'chap1',
      startTimeMs: 0, // Chapter start time (milliseconds)
      endTimeMs: 60000, // Chapter end time (milliseconds)
      startOffset: 0, // Start byte offset
      endOffset: -1, // End byte offset (-1 means unknown)
      subFrames: {
        TIT2: { text: 'Chapter 1 - Introduction' }, // Chapter title
        APIC: undefined, // APIC will be set in addChapterWithImage
      },
    };

    // Call function to add chapters and images
    const result = await addChapterWithImage(
      'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3', // Input MP3 file path
      'test_image.png', // Input image file path
      chapter
    );

    console.log(result ? 'Operation completed' : 'Operation failed');
    
    // Verify results
    if (result) {
      console.log('\n=== Verification Results ===');
      const readTags = NodeID3.read('C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3');
      console.log('Read chapters:', JSON.stringify(readTags.chapter, null, 2));
    }
    
    // Clean up test files
    fs.unlinkSync('test_image.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute test
testSubFramesApproach().catch(console.error);
