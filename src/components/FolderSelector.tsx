import React, { useState, useEffect } from 'react';
import { platformService } from '@/services/PlatformService';
import { PANEL_CLASS } from '@/constants/dialogStyles';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

const CLOSE_ICON_PATH =
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';

interface FolderSelectorProps {
  selectedFolder: string | null;
  onFolderSelect: (folderPath: string) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolder,
  onFolderSelect,
  onClose,
  isLoading = false,
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
          <div className={`${PANEL_CLASS} mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Use Saved Folder?</h2>
              {onClose && savedFolder && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={CLOSE_ICON_PATH} />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-300 mb-2">Previously selected folder:</p>
            <p className="text-sm bg-black bg-opacity-50 p-2 rounded break-all mb-4">
              {savedFolder}
            </p>
            <div className="flex gap-2">
              <Button
                variant="success"
                onClick={handleUseSavedFolder}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Loading...' : 'Use This Folder'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleSelectFolder}
                disabled={isLoading}
                className="flex-1"
              >
                Choose Different
              </Button>
            </div>
          </div>
        )}

        {!savedFolder && (
          <div className={`${PANEL_CLASS} mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Select Media Folder</h2>
              {onClose && savedFolder && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d={CLOSE_ICON_PATH} />
                  </svg>
                </button>
              )}
            </div>

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

            <Button
              variant="primary"
              size="lg"
              onClick={handleSelectFolder}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Loading...
                </span>
              ) : (
                'Choose Folder'
              )}
            </Button>
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