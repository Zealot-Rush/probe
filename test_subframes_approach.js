const NodeID3 = require('node-id3');
const fs = require('fs');
const { promisify } = require('util');

// 将fs.readFile转换为Promise以支持async/await
const readFileAsync = promisify(fs.readFile);

// 定义章节和图片的类型（JavaScript对象）
// Chapter 对象结构：
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

// 异步函数：为MP3文件添加章节和图片
async function addChapterWithImage(
  mp3Path,
  imagePath,
  chapter
) {
  try {
    // 读取MP3文件
    const mp3Buffer = await readFileAsync(mp3Path);

    // 读取图片文件
    const imageBuffer = await readFileAsync(imagePath);

    // 创建ID3标签对象
    const tags = {
      chapter: [
        {
          elementID: chapter.elementID,
          startTimeMs: chapter.startTimeMs,
          endTimeMs: chapter.endTimeMs,
          startOffset: chapter.startOffset,
          endOffset: chapter.endOffset,
          subFrames: {
            // 章节标题
            TIT2: { text: chapter.subFrames.TIT2?.text || '' },
            // 章节图片
            APIC: {
              mime: 'image/png', // MIME类型，推荐使用PNG或JPEG
              type: { id: 0, name: 'other' }, // 图片类型，0表示通用类型
              description: 'Chapter Image', // 图片描述
              data: imageBuffer, // 图片二进制数据
            },
          },
        },
      ],
    };

    console.log('创建的标签:', JSON.stringify(tags, null, 2));

    // 写入ID3标签到MP3文件
    const success = NodeID3.write(tags, mp3Buffer);

    if (success) {
      console.log('成功添加章节和图片！');
      return true;
    } else {
      console.error('写入ID3标签失败');
      return false;
    }
  } catch (error) {
    console.error('错误:', error);
    return false;
  }
}

// 测试函数
async function testSubFramesApproach() {
  try {
    // 创建一个小的测试图片（1x1像素的PNG）
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    // 保存测试图片
    fs.writeFileSync('test_image.png', testImageBuffer);
    
    const chapter = {
      elementID: 'chap1',
      startTimeMs: 0, // 章节开始时间（毫秒）
      endTimeMs: 60000, // 章节结束时间（毫秒）
      startOffset: 0, // 开始字节偏移
      endOffset: -1, // 结束字节偏移（-1表示未知）
      subFrames: {
        TIT2: { text: 'Chapter 1 - Introduction' }, // 章节标题
        APIC: undefined, // APIC将在addChapterWithImage中设置
      },
    };

    // 调用函数，添加章节和图片
    const result = await addChapterWithImage(
      'C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3', // 输入MP3文件路径
      'test_image.png', // 输入图片文件路径
      chapter
    );

    console.log(result ? '操作完成' : '操作失败');
    
    // 验证结果
    if (result) {
      console.log('\n=== 验证结果 ===');
      const readTags = NodeID3.read('C:\\Users\\ZackYang\\Desktop\\output_with_chapters.mp3');
      console.log('读取到的章节:', JSON.stringify(readTags.chapter, null, 2));
    }
    
    // 清理测试文件
    fs.unlinkSync('test_image.png');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 执行测试
testSubFramesApproach().catch(console.error);
