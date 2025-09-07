import React, { useState, useEffect } from 'react';
import { FileSelector } from './components/FileSelector';
import { ChapterManager } from './components/ChapterManager';
import { useElectronAPI } from './hooks/useElectronAPI';
import { ChapterInfo } from './types';

export const App: React.FC = () => {
  const { api, isReady } = useElectronAPI();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    duration: number;
    size: number;
  } | null>(null);
  const [isFFmpegAvailable, setIsFFmpegAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    type: 'success' | 'info' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

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
    setIsLoading(true);
    setExtractionStatus({ type: null, message: '' });
    
    if (!api) {
      setIsLoading(false);
      return;
    }
    
    try {
      // 获取文件信息
      const durationResult = await api.getMp3Duration(filePath);
      if (durationResult?.success && durationResult.data) {
        const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
        setFileInfo({
          name: fileName,
          duration: durationResult.data,
          size: 0, // 可以添加文件大小获取逻辑
        });
      }
      
      // 自动提取章节信息
      console.log('开始提取章节信息...');
      const chaptersResult = await api.extractChapters(filePath);
      console.log('章节提取结果:', chaptersResult);
      
      if (chaptersResult?.success && chaptersResult.data) {
        const extractedChapters = chaptersResult.data;
        console.log('成功提取到章节:', extractedChapters);
        
        if (extractedChapters.length > 0) {
          setChapters(extractedChapters);
          setExtractionStatus({ 
            type: 'success', 
            message: `成功提取到 ${extractedChapters.length} 个章节` 
          });
          console.log('章节已自动加载到界面');
        } else {
          console.log('文件中没有找到章节信息');
          setChapters([]); // 清空现有章节
          setExtractionStatus({ 
            type: 'info', 
            message: '文件中没有找到章节信息，您可以手动添加章节' 
          });
        }
      } else {
        console.log('章节提取失败或文件中没有章节:', chaptersResult?.error);
        setChapters([]); // 清空现有章节
        setExtractionStatus({ 
          type: 'error', 
          message: `章节提取失败: ${chaptersResult?.error || '未知错误'}` 
        });
      }
    } catch (error) {
      console.error('处理文件失败:', error);
      setChapters([]); // 清空现有章节
      setExtractionStatus({ 
        type: 'error', 
        message: `处理文件失败: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };


  // 添加章节到MP3文件
  const handleAddChaptersToMp3 = async () => {
    if (!selectedFile || chapters.length === 0 || !api) {
      console.log('添加章节失败: 缺少必要参数', { selectedFile, chaptersLength: chapters.length });
      alert('请确保已选择MP3文件并添加章节数据！');
      return;
    }
    
    try {
      // 生成默认文件名
      const inputFileName = selectedFile.split('\\').pop() || selectedFile.split('/').pop() || 'output';
      const nameWithoutExt = inputFileName.replace(/\.[^/.]+$/, '');
      const defaultFileName = `${nameWithoutExt}_with_chapters.mp3`;
      
      // 让用户选择输出位置
      const outputPath = await api.selectOutputFile(defaultFileName);
      if (!outputPath) {
        return; // 用户取消了选择
      }
      
      console.log('开始添加章节到MP3文件...', {
        inputPath: selectedFile,
        outputPath,
        chaptersCount: chapters.length,
        chapters: chapters
      });
      
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
            isLoading={isLoading}
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
          
          {/* 处理状态指示器 */}
          {isLoading && (
            <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 text-sm">正在提取章节信息...</span>
              </div>
            </div>
          )}
          
          {/* 章节提取状态消息 */}
          {extractionStatus.type && !isLoading && (
            <div className={`mt-4 rounded-lg border p-4 ${
              extractionStatus.type === 'success' ? 'bg-green-50 border-green-200' :
              extractionStatus.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  extractionStatus.type === 'success' ? 'bg-green-500' :
                  extractionStatus.type === 'error' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></div>
                <span className={`text-sm ${
                  extractionStatus.type === 'success' ? 'text-green-700' :
                  extractionStatus.type === 'error' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {extractionStatus.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 章节管理 */}
        <div className="mb-6">
          <ChapterManager
            chapters={chapters}
            onChaptersChange={setChapters}
            selectedFile={selectedFile}
            audioDuration={fileInfo?.duration}
          />
        </div>

        {/* 操作区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">操作</h3>
          

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddChaptersToMp3}
              disabled={!selectedFile || chapters.length === 0 || isLoading}
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
