import React, { useState } from 'react';
import { ChapterInfo } from '../types';
import { useElectronAPI } from '../hooks/useElectronAPI';

interface ChapterManagerProps {
  chapters: ChapterInfo[];
  onChaptersChange: (chapters: ChapterInfo[]) => void;
  selectedFile?: string | null;
  audioDuration?: number; // Total duration of audio file (seconds)
}

export const ChapterManager: React.FC<ChapterManagerProps> = ({
  chapters,
  onChaptersChange,
  selectedFile,
  audioDuration,
}) => {
  const { api, isReady } = useElectronAPI();

  // Convert time string to seconds
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert seconds to time string
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  };

  // Get chapter end time
  const getChapterEndTime = (index: number): string => {
    const currentChapter = chapters[index];
    if (!currentChapter) return '00:00:00.000';

    const currentStartTime = timeToSeconds(currentChapter.startTime);
    
    // Check if there's a next chapter
    if (index < chapters.length - 1) {
      const nextChapter = chapters[index + 1];
      const nextStartTime = timeToSeconds(nextChapter.startTime);
      return secondsToTime(nextStartTime);
    }
    
    // If no next chapter, use audio file total duration
    if (audioDuration) {
      return secondsToTime(audioDuration);
    }
    
    // If no audio duration info, show "End of file"
    return 'End of file';
  };

  const addChapter = () => {
    const newChapter: ChapterInfo = {
      title: `Chapter ${chapters.length + 1}`,
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
      console.log('API not ready:', { api: !!api, isReady });
      return;
    }
    
    try {
      console.log('Starting image selection...');
      const imagePath = await api.selectImageFile();
      console.log('Selected image path:', imagePath);
      
      if (imagePath) {
        // Convert image to base64 for UI display
        console.log('Starting image to base64 conversion...');
        const result = await api.imageToBase64(imagePath);
        console.log('Conversion result:', result);
        
        if (result.success && result.data) {
          console.log('Image conversion successful, updating chapter data...');
          // Update image and type in one go
          const updatedChapters = chapters.map((chapter, i) =>
            i === index ? { ...chapter, image: result.data, imageType: 'file' as const } : chapter
          );
          console.log('Updated chapter data:', updatedChapters[index]);
          onChaptersChange(updatedChapters);
        } else {
          console.error('Image conversion failed:', result.error);
        }
      } else {
        console.log('No image file selected');
      }
    } catch (error) {
      console.error('Failed to select image:', error);
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Management</h3>
      

      {/* Add New Chapter */}
      <div className="bg-gray-50 rounded-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Chapter Management</h4>
          <button
            onClick={addChapter}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            + Add New Chapter
          </button>
        </div>
      </div>

      {/* Chapter List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No chapter data
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex gap-4">
                {/* Chapter Image */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                    {chapter.image ? (
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Image loaded successfully:', chapter.title)}
                        onError={(e) => console.error('Image load failed:', chapter.title, e)}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => selectImageForChapter(index)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      Select
                    </button>
                    {chapter.image && (
                      <button
                        onClick={() => removeImageFromChapter(index)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Chapter Information */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, 'title', e.target.value)}
                      placeholder="Chapter Title"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={chapter.startTime}
                      onChange={(e) => updateChapter(index, 'startTime', e.target.value)}
                      placeholder="Start Time (HH:MM:SS.sss)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chapter.description || ''}
                      onChange={(e) => updateChapter(index, 'description', e.target.value)}
                      placeholder="Chapter Description (Optional)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* Auto-calculated end time display */}
                  <div className="text-xs text-gray-500">
                    End Time: {getChapterEndTime(index)}
                  </div>

                  {/* Image type indicator */}
                  {chapter.imageType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Image Type:</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        chapter.imageType === 'extracted' ? 'bg-orange-100 text-orange-800' :
                        chapter.imageType === 'file' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {chapter.imageType === 'extracted' ? 'Auto Extracted' :
                         chapter.imageType === 'file' ? 'Manually Selected' : 'Unknown'}
                      </span>
                    </div>
                  )}
                  
                  {/* Debug info - shown in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400">
                      Debug: Image={chapter.image ? 'Yes' : 'No'}, Type={chapter.imageType || 'None'}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => removeChapter(index)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    Delete Chapter
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
