import React, { useState } from 'react';
import { useElectronAPI } from '../hooks/useElectronAPI';

interface FileSelectorProps {
  onFileSelected: (filePath: string) => void;
  selectedFile: string | null;
  isLoading?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelected, selectedFile, isLoading: externalLoading = false }) => {
  const { api, isReady } = useElectronAPI();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectFile = async () => {
    if (!api || !isReady) return;
    
    setIsSelecting(true);
    try {
      const filePath = await api.selectMp3File();
      if (filePath) {
        onFileSelected(filePath);
      }
    } catch (error) {
      console.error('选择文件失败:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择MP3文件</h3>
      
      <div className="flex gap-3">
        <input
          type="text"
          value={selectedFile || ''}
          placeholder="请选择MP3文件..."
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={handleSelectFile}
          disabled={!isReady || isSelecting || externalLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSelecting ? '选择中...' : externalLoading ? '处理中...' : '选择文件'}
        </button>
      </div>
    </div>
  );
};
