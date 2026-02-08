import React, { useEffect, useCallback, useState } from 'react';
import { MediaFilter } from '@/types/media';
import { usePlatformDetection } from '@/hooks/usePlatformDetection';
import { useMediaLoader } from '@/hooks/useMediaLoader';
import { useFolderManager } from '@/hooks/useFolderManager';
import { useMediaFilter } from '@/hooks/useMediaFilter';
import { usePersistedSlideshowConfig } from '@/hooks/usePersistedSlideshowConfig';
import { LoadingState } from '@/components/AppStates/LoadingState';
import { ErrorState } from '@/components/AppStates/ErrorState';
import { NoMediaState } from '@/components/AppStates/NoMediaState';
import FolderSelector from '@/components/FolderSelector';
import Slideshow from '@/components/Slideshow';
import { SplashScreen } from '@/components/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const { isElectron, isInitialized } = usePlatformDetection();
  const {
    mediaFiles,
    isLoading,
    error,
    loadMediaFromAPI,
    loadMediaFromFolder,
    setError,
  } = useMediaLoader();
  const {
    selectedFolder,
    setSelectedFolder,
    checkForSavedFolder,
    selectFolder,
    clearSavedFolder,
  } = useFolderManager();
  const { filter, setFilter } = useMediaFilter(MediaFilter.ALL);
  const { config: slideshowConfig, setConfig: setSlideshowConfig } = usePersistedSlideshowConfig();

  useEffect(() => {
    if (!isInitialized) return;

    console.log(`[App] Initialized: isElectron=${isElectron}`);
    
    if (isElectron) {
      console.log('[App] Electron mode: Checking for saved folder');
      checkForSavedFolder().then((savedFolder) => {
        if (savedFolder) {
          console.log(`[App] Found saved folder: ${savedFolder}, loading media...`);
          loadMediaFromFolder(savedFolder);
        } else {
          console.log('[App] No saved folder found, will show folder selector');
        }
      });
    } else {
      console.log('[App] Web mode: Loading media from API');
      loadMediaFromAPI();
    }
  }, [isInitialized, isElectron, checkForSavedFolder, loadMediaFromAPI, loadMediaFromFolder]);

  const handleFolderSelect = useCallback(
    async (folderPath: string) => {
      setSelectedFolder(folderPath);
      await loadMediaFromFolder(folderPath);
    },
    [setSelectedFolder, loadMediaFromFolder]
  );

  const handleClearSavedFolder = useCallback(async () => {
    await clearSavedFolder();
  }, [clearSavedFolder]);

  const handleRetry = useCallback(() => {
    setError(null);
    if (isElectron) {
      if (selectedFolder) {
        loadMediaFromFolder(selectedFolder);
      } else {
        checkForSavedFolder();
      }
    } else {
      loadMediaFromAPI();
    }
  }, [isElectron, selectedFolder, setError, loadMediaFromAPI, loadMediaFromFolder, checkForSavedFolder]);

  if (isElectron && !splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (!isInitialized) {
    return <LoadingState message="Initializing..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRetry}
        onSecondaryAction={isElectron ? () => setSelectedFolder(null) : undefined}
        secondaryActionLabel={isElectron ? 'Choose Different Folder' : undefined}
      />
    );
  }

  if (isElectron && !selectedFolder && !isLoading) {
    return (
      <FolderSelector
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
        onClose={() => {
          checkForSavedFolder().then((saved) => {
            if (saved) {
              setSelectedFolder(saved);
              loadMediaFromFolder(saved);
            }
          });
        }}
        isLoading={isLoading}
      />
    );
  }

  if (isElectron && selectedFolder && mediaFiles.length === 0 && !isLoading) {
    return (
      <NoMediaState
        message="No media files found in selected folder"
        subMessage={`Selected folder: ${selectedFolder}`}
        onPrimaryAction={() => handleFolderSelect(selectedFolder)}
        primaryActionLabel="Reload Folder"
        onSecondaryAction={() => setSelectedFolder(null)}
        secondaryActionLabel="Choose Different Folder"
        selectedFolder={selectedFolder}
      />
    );
  }

  if (isLoading && mediaFiles.length === 0) {
    return (
      <LoadingState
        message="Loading media files..."
        subMessage={isElectron ? 'Electron mode detected' : undefined}
      />
    );
  }

  if (!isElectron && mediaFiles.length === 0 && !isLoading) {
    return (
      <NoMediaState
        message="No media files found"
        subMessage="Place your photos and videos in the /media folder"
      />
    );
  }

  return (
    <div className="relative">
      <Slideshow
        mediaFiles={mediaFiles}
        config={slideshowConfig}
        onConfigChange={setSlideshowConfig}
        selectedFolder={selectedFolder}
        onChangeFolder={() => setSelectedFolder(null)}
        onClearSavedFolder={handleClearSavedFolder}
        isElectron={isElectron}
        mediaFilter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
}
