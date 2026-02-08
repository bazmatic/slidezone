import React, { useState, useEffect } from 'react';
import { platformService } from '@/services/PlatformService';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface FolderSelectorProps {
  selectedFolder: string | null;
  onFolderSelect: (folderPath: string) => void;
  isLoading?: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ 
  selectedFolder, 
  onFolderSelect, 
  isLoading = false 
}) => {
  const [savedFolder, setSavedFolder] = useState<string | null>(null);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);

  useEffect(() => {
    const checkForSavedFolder = async () => {
      try {
        const electronService = platformService.getElectronService();
        if (electronService) {
          const saved = await electronService.getSavedFolder();
          setSavedFolder(saved || null);
        }
      } catch (err) {
        console.error('Error checking saved folder:', err);
      } finally {
        setIsCheckingSaved(false);
      }
    };

    checkForSavedFolder();
  }, []);

  const handleSelectFolder = async () => {
    const electronService = platformService.getElectronService();
    if (electronService) {
      const folderPath = await electronService.selectFolder();
      if (folderPath) {
        onFolderSelect(folderPath);
      }
    }
  };

  const handleUseSavedFolder = async () => {
    if (savedFolder) {
      onFolderSelect(savedFolder);
    }
  };

  if (isCheckingSaved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <LoadingSpinner text="Checking saved folder..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-8">SlideZone</h1>
        
        {savedFolder && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6">
            <h2 className="text-xl mb-4">Use Saved Folder?</h2>
            <p className="text-sm text-gray-300 mb-2">Previously selected folder:</p>
            <p className="text-sm bg-black bg-opacity-50 p-2 rounded break-all mb-4">
              {savedFolder}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUseSavedFolder}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 bg-opacity-20 rounded hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Use This Folder'}
              </button>
              <button
                onClick={handleSelectFolder}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Different
              </button>
            </div>
          </div>
        )}

        {!savedFolder && (
          <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6">
            <h2 className="text-xl mb-4">Select Media Folder</h2>
            
            {selectedFolder ? (
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2">Selected folder:</p>
                <p className="text-sm bg-black bg-opacity-50 p-2 rounded break-all">
                  {selectedFolder}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 mb-4">
                Choose a folder containing your photos and videos
              </p>
            )}
            
            <button
              onClick={handleSelectFolder}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Choose Folder'
              )}
            </button>
          </div>
        )}
        
        <div className="text-sm text-gray-400">
          <p>Supported formats:</p>
          <p>Photos: JPG, PNG, GIF, BMP, WebP</p>
          <p>Videos: MP4, WebM, OGG, MOV, AVI</p>
        </div>
      </div>
    </div>
  );
};

export default FolderSelector; 