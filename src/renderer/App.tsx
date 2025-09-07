import React, { useState, useEffect } from 'react';
import { FileSelector } from './components/FileSelector';
import { ChapterManager } from './components/ChapterManager';
import { useElectronAPI } from './hooks/useElectronAPI';
import { ChapterInfo } from './types';

export const App: React.FC = () => {
  const { api, isReady } = useElectronAPI();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [outputDir, setOutputDir] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    duration: number;
    size: number;
  } | null>(null);
  const [isFFmpegAvailable, setIsFFmpegAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 检查FFmpeg可用性
  useEffect(() => {
    const checkFFmpeg = async () => {
      if (!api) return;
      try {
        const result = await api.checkID3Available();
        setIsFFmpegAvailable(result.success && result.data === true);
      } catch (error) {
        console.error('检查FFmpeg失败:', error);
        setIsFFmpegAvailable(false);
      }
    };
    
    if (isReady) {
      checkFFmpeg();
    }
  }, [api, isReady]);

  // 处理文件选择
  const handleFileSelected = async (filePath: string) => {
    setSelectedFile(filePath);
    
    // 获取文件信息
    if (!api) return;
    try {
      const durationResult = await api.getMp3Duration(filePath);
      if (durationResult?.success && durationResult.data) {
        const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
        setFileInfo({
          name: fileName,
          duration: durationResult.data,
          size: 0, // 可以添加文件大小获取逻辑
        });
      }
    } catch (error) {
      console.error('获取文件信息失败:', error);
    }
  };

  // 提取现有章节
  const handleExtractChapters = async () => {
    if (!selectedFile || !api) return;
    
    try {
      const result = await api.extractChapters(selectedFile);
      if (result?.success && result.data) {
        setChapters(result.data);
      }
    } catch (error) {
      console.error('提取章节失败:', error);
    }
  };

  // 保存章节到文件
  const handleSaveChapters = async () => {
    if (!api || chapters.length === 0) return;
    
    try {
      const result = await api.selectOutputDirectory();
      if (result) {
        const fileName = `chapters_${Date.now()}.json`;
        const filePath = `${result}/${fileName}`;
        await api.saveChaptersToFile({ filePath, chapters });
        alert('章节保存成功！');
      }
    } catch (error) {
      console.error('保存章节失败:', error);
    }
  };

  // 加载章节文件
  const handleLoadChapters = async () => {
    if (!api) return;
    
    try {
      // 这里需要添加文件选择逻辑
      // 暂时使用示例数据
      const sampleChapters: ChapterInfo[] = [
        { title: '第一章', startTime: '00:00:00.000' },
        { title: '第二章', startTime: '00:05:30.000' },
        { title: '第三章', startTime: '00:10:15.000' },
      ];
      setChapters(sampleChapters);
    } catch (error) {
      console.error('加载章节失败:', error);
    }
  };

  // 提取章节缩略图

  // 添加章节到MP3文件
  const handleAddChaptersToMp3 = async () => {
    if (!selectedFile || !outputDir || chapters.length === 0 || !api) {
      console.log('添加章节失败: 缺少必要参数', { selectedFile, outputDir, chaptersLength: chapters.length });
      alert('请确保已选择MP3文件、输出目录和章节数据！');
      return;
    }
    
    console.log('开始添加章节到MP3文件...', {
      inputPath: selectedFile,
      outputDir,
      chaptersCount: chapters.length,
      chapters: chapters
    });
    
    try {
      const outputPath = `${outputDir}/output_with_chapters.mp3`;
      console.log('输出路径:', outputPath);
      
      const result = await api.addChaptersToMp3({ inputPath: selectedFile, outputPath, chapters });
      console.log('添加章节结果:', result);
      
      if (result?.success) {
        alert('章节添加成功！');
      } else {
        const errorMsg = result?.error || '未知错误';
        console.error('添加章节失败:', errorMsg);
        alert(`章节添加失败！\n错误信息: ${errorMsg}`);
      }
    } catch (error) {
      console.error('添加章节失败:', error);
      alert(`添加章节失败！\n错误信息: ${error instanceof Error ? error.message : String(error)}`);
    }
  };


  // 选择输出目录
  const handleSelectOutputDir = async () => {
    if (!api) return;
    
    try {
      const result = await api.selectOutputDirectory();
      if (result) {
        setOutputDir(result);
      }
    } catch (error) {
      console.error('选择输出目录失败:', error);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎵 Probe</h1>
          <p className="text-xl text-gray-600">MP3章节添加工具</p>
          
          {/* FFmpeg状态 */}
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
            {isFFmpegAvailable === null ? (
              <span className="text-gray-500">检查FFmpeg状态中...</span>
            ) : isFFmpegAvailable ? (
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full">
                ✓ FFmpeg 可用
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full">
                ✗ FFmpeg 不可用
              </span>
            )}
          </div>
        </div>

        {/* 文件选择 */}
        <div className="mb-6">
          <FileSelector
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
          />
          
          {/* 文件信息 */}
          {fileInfo && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">文件信息</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">文件名:</span>
                  <span className="ml-2 font-medium">{fileInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">时长:</span>
                  <span className="ml-2 font-medium">
                    {Math.floor(fileInfo.duration / 60)}:{(fileInfo.duration % 60).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">大小:</span>
                  <span className="ml-2 font-medium">未知</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 章节管理 */}
        <div className="mb-6">
          <ChapterManager
            chapters={chapters}
            onChaptersChange={setChapters}
            onExtractChapters={handleExtractChapters}
            onSaveChapters={handleSaveChapters}
            onLoadChapters={handleLoadChapters}
            onExtractThumbnails={() => {}}
            isExtracting={isLoading}
            selectedFile={selectedFile}
            audioDuration={fileInfo?.duration}
          />
        </div>

        {/* 操作区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
          
          {/* 输出目录选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出目录
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={outputDir || ''}
                placeholder="请选择输出目录..."
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSelectOutputDir}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                选择目录
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddChaptersToMp3}
              disabled={!selectedFile || !outputDir || chapters.length === 0 || isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : '添加章节到文件'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
