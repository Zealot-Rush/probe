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

  // Check FFmpeg availability
  useEffect(() => {
    const checkFFmpeg = async () => {
      if (!api) return;
      try {
        const result = await api.checkID3Available();
        setIsFFmpegAvailable(result.success && result.data === true);
      } catch (error) {
        console.error('Failed to check FFmpeg:', error);
        setIsFFmpegAvailable(false);
      }
    };
    
    if (isReady) {
      checkFFmpeg();
    }
  }, [api, isReady]);

  // Handle file selection
  const handleFileSelected = async (filePath: string) => {
    setSelectedFile(filePath);
    setIsLoading(true);
    setExtractionStatus({ type: null, message: '' });
    
    if (!api) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Get file information
      const durationResult = await api.getMp3Duration(filePath);
      if (durationResult?.success && durationResult.data) {
        const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
        setFileInfo({
          name: fileName,
          duration: durationResult.data,
          size: 0, // Can add file size retrieval logic
        });
      }
      
      // Auto-extract chapter information
      console.log('Starting chapter extraction...');
      const chaptersResult = await api.extractChapters(filePath);
      console.log('Chapter extraction result:', chaptersResult);
      
      if (chaptersResult?.success && chaptersResult.data) {
        const extractedChapters = chaptersResult.data;
        console.log('Successfully extracted chapters:', extractedChapters);
        
        if (extractedChapters.length > 0) {
          setChapters(extractedChapters);
          setExtractionStatus({ 
            type: 'success', 
            message: `Successfully extracted ${extractedChapters.length} chapters` 
          });
          console.log('Chapters automatically loaded to interface');
        } else {
          console.log('No chapter information found in file');
          setChapters([]); // Clear existing chapters
          setExtractionStatus({ 
            type: 'info', 
            message: 'No chapter information found in file, you can manually add chapters' 
          });
        }
      } else {
        console.log('Chapter extraction failed or no chapters in file:', chaptersResult?.error);
        setChapters([]); // Clear existing chapters
        setExtractionStatus({ 
          type: 'error', 
          message: `Chapter extraction failed: ${chaptersResult?.error || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Failed to process file:', error);
      setChapters([]); // Clear existing chapters
      setExtractionStatus({ 
        type: 'error', 
        message: `Failed to process file: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Add chapters to MP3 file
  const handleAddChaptersToMp3 = async () => {
    if (!selectedFile || chapters.length === 0 || !api) {
      console.log('Failed to add chapters: missing required parameters', { selectedFile, chaptersLength: chapters.length });
      alert('Please ensure you have selected an MP3 file and added chapter data!');
      return;
    }
    
    try {
      // Generate default filename
      const inputFileName = selectedFile.split('\\').pop() || selectedFile.split('/').pop() || 'output';
      const nameWithoutExt = inputFileName.replace(/\.[^/.]+$/, '');
      const defaultFileName = `${nameWithoutExt}_with_chapters.mp3`;
      
      // Let user select output location
      const outputPath = await api.selectOutputFile(defaultFileName);
      if (!outputPath) {
        return; // User cancelled selection
      }
      
      console.log('Starting to add chapters to MP3 file...', {
        inputPath: selectedFile,
        outputPath,
        chaptersCount: chapters.length,
        chapters: chapters
      });
      
      const result = await api.addChaptersToMp3({ inputPath: selectedFile, outputPath, chapters });
      console.log('Add chapters result:', result);
      
      if (result?.success) {
        alert('Chapters added successfully!');
      } else {
        const errorMsg = result?.error || 'Unknown error';
        console.error('Failed to add chapters:', errorMsg);
        alert(`Failed to add chapters!\nError: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Failed to add chapters:', error);
      alert(`Failed to add chapters!\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  };



  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎵 Probe</h1>
          <p className="text-xl text-gray-600">MP3 Chapter Management Tool</p>
          
          {/* FFmpeg Status */}
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
            {isFFmpegAvailable === null ? (
              <span className="text-gray-500">Checking FFmpeg status...</span>
            ) : isFFmpegAvailable ? (
              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full">
                ✓ FFmpeg Available
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full">
                ✗ FFmpeg Not Available
              </span>
            )}
          </div>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <FileSelector
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
            isLoading={isLoading}
          />
          
          {/* File Information */}
          {fileInfo && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">File Information</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">File Name:</span>
                  <span className="ml-2 font-medium">{fileInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">
                    {Math.floor(fileInfo.duration / 60)}:{(fileInfo.duration % 60).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">Unknown</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Processing Status Indicator */}
          {isLoading && (
            <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 text-sm">Extracting chapter information...</span>
              </div>
            </div>
          )}
          
          {/* Chapter Extraction Status Message */}
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

        {/* Chapter Management */}
        <div className="mb-6">
          <ChapterManager
            chapters={chapters}
            onChaptersChange={setChapters}
            selectedFile={selectedFile}
            audioDuration={fileInfo?.duration}
          />
        </div>

        {/* Operations Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations</h3>
          

          {/* Operation Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddChaptersToMp3}
              disabled={!selectedFile || chapters.length === 0 || isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Add Chapters to File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
