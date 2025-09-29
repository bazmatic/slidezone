'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, MediaFilter } from '@/types/media';
import Slideshow from '@/components/Slideshow';
import FolderSelector from '@/components/FolderSelector';

export default function Home() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>(MediaFilter.ALL);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
    
    // Check for Electron API with a small delay to ensure preload script has loaded
    const checkElectron = () => {
      const isElectronEnv = !!(window as any).electronAPI;
      console.log('Electron detected:', isElectronEnv);
      console.log('Window object keys:', Object.keys(window));
      console.log('electronAPI available:', !!(window as any).electronAPI);
      console.log('testAPI available:', !!(window as any).testAPI);
      
      setIsElectron(isElectronEnv);
      setIsInitialized(true);
      
      if (isElectronEnv) {
        console.log('Running in Electron mode');
        checkForSavedFolder();
      } else {
        console.log('Running in web mode - loading media files');
        loadMediaFromAPI();
      }
    };

    // Try immediately and also after a short delay
    checkElectron();
    const timeoutId = setTimeout(checkElectron, 100);
    
    // Fallback: if still not initialized after 2 seconds, assume Electron mode
    const fallbackTimeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.log('Fallback: Assuming Electron mode after timeout');
        setIsElectron(true);
        setIsInitialized(true);
        checkForSavedFolder();
      }
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeoutId);
    };
  }, [loadMediaFromAPI, checkForSavedFolder, isInitialized]);

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
    hasMediaFiles: mediaFiles.length > 0,
    isInitialized
  });

  // Show loading screen until we've initialized and detected the environment
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  // Show folder selector if we're in Electron mode and no folder is selected
  if (isElectron && !selectedFolder && !isLoading && !error) {
    console.log('Showing folder selector - no folder selected');
    return (
      <FolderSelector
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
        isLoading={isLoading}
      />
    );
  }

  // Show "no media files found" for Electron mode when folder is selected but empty
  if (isElectron && selectedFolder && mediaFiles.length === 0 && !isLoading && !error) {
    console.log('Showing no media files message - folder selected but empty');
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="mb-4">No media files found in selected folder</p>
          <p className="text-sm text-gray-400 mb-4">
            Selected folder: {selectedFolder}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleFolderSelect(selectedFolder)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all mr-2"
            >
              Reload Folder
            </button>
            <button
              onClick={() => setSelectedFolder(null)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
            >
              Choose Different Folder
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show folder selector if we're in Electron mode and no media files are found (default behavior)
  if (isElectron && mediaFiles.length === 0 && !isLoading && !error) {
    console.log('Showing folder selector - no media files found, default behavior');
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