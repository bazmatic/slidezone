'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, MediaFilter } from '@/types/media';
import Slideshow from '@/components/Slideshow';
import FolderSelector from '@/components/FolderSelector';

export default function Home() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: 'test-1',
      name: 'test-image',
      path: '/media/00049-2956718934.png',
      type: MediaType.PHOTO,
      extension: '.png'
    }
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>(MediaFilter.ALL);

  const loadMediaFromAPI = useCallback(async () => {
    try {
      console.log('Loading media from API...');
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/media');
      const data = await response.json();
      console.log('API response:', { success: data.success, count: data.count });

      if (data.success) {
        console.log('Setting media files:', data.files.length);
        setMediaFiles(data.files);
      } else {
        console.error('API error:', data.error);
        setError(data.error || 'Failed to load media files');
      }
    } catch (err) {
      console.error('Error loading media files:', err);
      setError(`Failed to load media files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  const checkForSavedFolder = useCallback(async () => {
    try {
      console.log('Checking for saved folder...');
      const savedFolder = await (window as any).electronAPI.getSavedFolder();
      console.log('Saved folder found:', savedFolder);
      
      if (savedFolder) {
        // Try to load the saved folder
        console.log('Loading saved folder:', savedFolder);
        await handleFolderSelect(savedFolder);
      } else {
        // No saved folder, show folder selector
        console.log('No saved folder, showing folder selector');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error checking saved folder:', err);
      setError(`Failed to check saved folder: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('App starting...');
    
    // Simplified logic - just load media files in web mode
    const isElectronEnv = !!(window as any).electronAPI;
    console.log('Electron detected:', isElectronEnv);
    setIsElectron(isElectronEnv);
    
    if (isElectronEnv) {
      console.log('Running in Electron mode');
      checkForSavedFolder();
    } else {
      console.log('Running in web mode - loading media files');
      loadMediaFromAPI();
    }
  }, [loadMediaFromAPI, checkForSavedFolder]);

  const handleFolderSelect = async (folderPath: string) => {
    console.log('Handling folder selection:', folderPath);
    setSelectedFolder(folderPath);
    setIsLoading(true);
    setError(null);

    try {
      if ((window as any).electronAPI) {
        // Electron mode - use the API
        console.log('Reading media folder in Electron mode');
        const data = await (window as any).electronAPI.readMediaFolder(folderPath);
        console.log('Media folder data:', data);
        
        if (data.success) {
          setMediaFiles(data.files);
        } else {
          setError(data.error || 'Failed to load media files');
        }
      } else {
        // Web mode - fallback to API route (for development)
        const response = await fetch('/api/media');
        const data = await response.json();

        if (data.success) {
          setMediaFiles(data.files);
        } else {
          setError(data.error || 'Failed to load media files');
        }
      }
    } catch (err) {
      setError(`Failed to load media files: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error loading media files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSavedFolder = async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.clearSavedFolder();
    }
    setSelectedFolder(null);
    setMediaFiles([]);
  };

  const handleFilterChange = useCallback((newFilter: MediaFilter) => {
    setMediaFilter(newFilter);
  }, []);

  console.log('Render state:', { 
    isElectron, 
    selectedFolder, 
    mediaFiles: mediaFiles.length, 
    isLoading, 
    error,
    hasMediaFiles: mediaFiles.length > 0
  });

  // Show folder selector if we're in Electron mode and either:
  // 1. No folder is selected, OR
  // 2. No media files are found (empty folder)
  if (isElectron && (!selectedFolder || mediaFiles.length === 0) && !isLoading && !error) {
    console.log('Showing folder selector - selectedFolder:', selectedFolder, 'mediaFiles.length:', mediaFiles.length, 'isLoading:', isLoading, 'error:', error);
    return (
      <FolderSelector
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
        isLoading={isLoading}
      />
    );
  }

  if (isLoading && mediaFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading media files...</p>
          {isElectron && (
            <p className="text-sm text-gray-400 mt-2">Electron mode detected</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                if (isElectron) {
                  checkForSavedFolder();
                } else {
                  loadMediaFromAPI();
                }
              }}
              className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all mr-2"
            >
              Retry
            </button>
            {isElectron && (
              <button 
                onClick={() => setSelectedFolder(null)}
                className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
              >
                Choose Different Folder
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // This should only show in web mode when no media files are found
  if (!isElectron && mediaFiles.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="mb-4">No media files found</p>
          <p className="text-sm text-gray-400">
            Place your photos and videos in the /media folder
          </p>
        </div>
      </div>
    );
  }

  // Debug: Show media files count
  console.log('About to render slideshow with', mediaFiles.length, 'files');
  
  return (
    <div className="relative">
      <Slideshow 
        mediaFiles={mediaFiles} 
        onChangeFolder={() => setSelectedFolder(null)}
        onClearSavedFolder={handleClearSavedFolder}
        isElectron={isElectron}
        mediaFilter={mediaFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
} 