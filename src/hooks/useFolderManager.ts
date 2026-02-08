import { useState, useCallback } from 'react';
import { platformService } from '@/services/PlatformService';

export function useFolderManager() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const checkForSavedFolder = useCallback(async (): Promise<string | null> => {
    try {
      const electronService = platformService.getElectronService();
      if (electronService) {
        const savedFolder = await electronService.getSavedFolder();
        if (savedFolder) {
          setSelectedFolder(savedFolder);
          return savedFolder;
        }
      }
      return null;
    } catch (err) {
      console.error('Error checking saved folder:', err);
      return null;
    }
  }, []);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    try {
      const electronService = platformService.getElectronService();
      if (electronService) {
        const folderPath = await electronService.selectFolder();
        if (folderPath) {
          setSelectedFolder(folderPath);
          return folderPath;
        }
      }
      return null;
    } catch (err) {
      console.error('Error selecting folder:', err);
      return null;
    }
  }, []);

  const clearSavedFolder = useCallback(async (): Promise<void> => {
    try {
      const electronService = platformService.getElectronService();
      if (electronService) {
        await electronService.clearSavedFolder();
      }
      setSelectedFolder(null);
    } catch (err) {
      console.error('Error clearing saved folder:', err);
    }
  }, []);

  return {
    selectedFolder,
    setSelectedFolder,
    checkForSavedFolder,
    selectFolder,
    clearSavedFolder,
  };
}

