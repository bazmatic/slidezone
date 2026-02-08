import { useState, useCallback, useRef } from 'react';
import { MediaFile } from '@/types/media';
import { platformService } from '@/services/PlatformService';

export function useMediaLoader() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, MediaFile[]>>(new Map());

  const loadMediaFromAPI = useCallback(async () => {
    try {
      console.log('[useMediaLoader] loadMediaFromAPI called - Web mode');
      setIsLoading(true);
      setError(null);

      const mediaService = platformService.getMediaService();
      const data = await mediaService.getMediaFiles();

      console.log(`[useMediaLoader] loadMediaFromAPI result: success=${data.success}, count=${data.count}`);
      
      if (data.success) {
        console.log(`[useMediaLoader] Loaded ${data.files.length} media files from web API`);
        setMediaFiles(data.files);
      } else {
        console.error('[useMediaLoader] loadMediaFromAPI failed:', data.error);
        setError(data.error || 'Failed to load media files');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useMediaLoader] loadMediaFromAPI error:', errorMessage);
      setError(`Failed to load media files: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMediaFromFolder = useCallback(async (folderPath: string, forceReload: boolean = false) => {
    console.log(`[useMediaLoader] loadMediaFromFolder called with path: ${folderPath}, forceReload: ${forceReload}`);
    const cached = forceReload ? undefined : cacheRef.current.get(folderPath);
    if (cached !== undefined) {
      setMediaFiles(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const electronService = platformService.getElectronService();

      if (!electronService) {
        const errorMsg = 'Electron service not available - cannot load folder in web mode';
        console.error(`[useMediaLoader] ${errorMsg}`);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log('[useMediaLoader] Using Electron service to read media folder');
      const data = await electronService.readMediaFolder(folderPath);

      console.log(`[useMediaLoader] readMediaFolder result: success=${data.success}, count=${data.count || data.files?.length || 0}`);

      if (data.success) {
        console.log(`[useMediaLoader] Loaded ${data.files.length} media files from folder: ${folderPath}`);
        cacheRef.current.set(folderPath, data.files);
        setMediaFiles(data.files);
      } else {
        console.error('[useMediaLoader] readMediaFolder failed:', data.error);
        setError(data.error || 'Failed to load media files');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useMediaLoader] loadMediaFromFolder error:', errorMessage);
      setError(`Failed to load media files: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mediaFiles,
    isLoading,
    error,
    loadMediaFromAPI,
    loadMediaFromFolder,
    setMediaFiles,
    setError,
  };
}

