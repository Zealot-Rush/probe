import React, { useState } from 'react';
import { ChapterInfo } from '../types';
import { useElectronAPI } from '../hooks/useElectronAPI';

interface ChapterManagerProps {
  chapters: ChapterInfo[];
  onChaptersChange: (chapters: ChapterInfo[]) => void;
  selectedFile?: string | null;
  audioDuration?: number; // 音频文件总时长（秒）
}

export const ChapterManager: React.FC<ChapterManagerProps> = ({
  chapters,
  onChaptersChange,
  selectedFile,
  audioDuration,
}) => {
  const { api, isReady } = useElectronAPI();

  // 将时间字符串转换为秒数
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // 将秒数转换为时间字符串
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  };

  // 获取章节的结束时间
  const getChapterEndTime = (index: number): string => {
    const currentChapter = chapters[index];
    if (!currentChapter) return '00:00:00.000';

    const currentStartTime = timeToSeconds(currentChapter.startTime);
    
    // 检查是否有下一个章节
    if (index < chapters.length - 1) {
      const nextChapter = chapters[index + 1];
      const nextStartTime = timeToSeconds(nextChapter.startTime);
      return secondsToTime(nextStartTime);
    }
    
    // 如果没有下一个章节，使用音频文件的总时长
    if (audioDuration) {
      return secondsToTime(audioDuration);
    }
    
    // 如果没有音频时长信息，显示"文件结束"
    return '文件结束';
  };

  const addChapter = () => {
    const newChapter: ChapterInfo = {
      title: `章节 ${chapters.length + 1}`,
      startTime: '00:00:00.000',
    };

    onChaptersChange([...chapters, newChapter]);
  };

  const removeChapter = (index: number) => {
    onChaptersChange(chapters.filter((_, i) => i !== index));
  };

  const updateChapter = (index: number, field: keyof ChapterInfo, value: string) => {
    const updatedChapters = chapters.map((chapter, i) =>
      i === index ? { ...chapter, [field]: value } : chapter
    );
    onChaptersChange(updatedChapters);
  };

  const selectImageForChapter = async (index: number) => {
    if (!api || !isReady) {
      console.log('API 未准备好:', { api: !!api, isReady });
      return;
    }
    
    try {
      console.log('开始选择图片...');
      const imagePath = await api.selectImageFile();
      console.log('选择的图片路径:', imagePath);
      
      if (imagePath) {
        // 将图片转换为base64以便在UI中显示
        console.log('开始转换图片为base64...');
        const result = await api.imageToBase64(imagePath);
        console.log('转换结果:', result);
        
        if (result.success && result.data) {
          console.log('图片转换成功，更新章节数据...');
          // 一次性更新图片和类型
          const updatedChapters = chapters.map((chapter, i) =>
            i === index ? { ...chapter, image: result.data, imageType: 'file' as const } : chapter
          );
          console.log('更新后的章节数据:', updatedChapters[index]);
          onChaptersChange(updatedChapters);
        } else {
          console.error('图片转换失败:', result.error);
        }
      } else {
        console.log('未选择图片文件');
      }
    } catch (error) {
      console.error('选择图片失败:', error);
    }
  };

  const removeImageFromChapter = (index: number) => {
    const updatedChapters = chapters.map((chapter, i) =>
      i === index ? { ...chapter, image: '', imageType: undefined } : chapter
    );
    onChaptersChange(updatedChapters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">章节管理</h3>
      

      {/* 添加新章节 */}
      <div className="bg-gray-50 rounded-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">章节管理</h4>
          <button
            onClick={addChapter}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            + 添加新章节
          </button>
        </div>
      </div>

      {/* 章节列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无章节数据
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex gap-4">
                {/* 章节图片 */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                    {chapter.image ? (
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('图片加载成功:', chapter.title)}
                        onError={(e) => console.error('图片加载失败:', chapter.title, e)}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        无图片
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => selectImageForChapter(index)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      选择
                    </button>
                    {chapter.image && (
                      <button
                        onClick={() => removeImageFromChapter(index)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        移除
                      </button>
                    )}
                  </div>
                </div>

                {/* 章节信息 */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, 'title', e.target.value)}
                      placeholder="章节标题"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={chapter.startTime}
                      onChange={(e) => updateChapter(index, 'startTime', e.target.value)}
                      placeholder="开始时间 (HH:MM:SS.sss)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chapter.description || ''}
                      onChange={(e) => updateChapter(index, 'description', e.target.value)}
                      placeholder="章节描述 (可选)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* 自动计算的结束时间显示 */}
                  <div className="text-xs text-gray-500">
                    结束时间: {getChapterEndTime(index)}
                  </div>

                  {/* 图片类型标识 */}
                  {chapter.imageType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">图片类型:</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        chapter.imageType === 'extracted' ? 'bg-orange-100 text-orange-800' :
                        chapter.imageType === 'file' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chapter.imageType === 'extracted' ? '自动提取' :
                         chapter.imageType === 'file' ? '手动选择' : '未知'}
                      </span>
                    </div>
                  )}
                  
                  {/* 调试信息 - 开发时显示 */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400">
                      调试: 图片={chapter.image ? '有' : '无'}, 类型={chapter.imageType || '无'}
                    </div>
                  )}
                </div>

                {/* 删除按钮 */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => removeChapter(index)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    删除章节
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
