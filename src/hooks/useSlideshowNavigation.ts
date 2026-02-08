import { useState, useCallback, useEffect, useRef } from 'react';
import { MediaFile, SlideshowConfig } from '@/types/media';
import { getDisplayTime } from '@/utils/mediaUtils';

export function useSlideshowNavigation(
  files: MediaFile[],
  config: SlideshowConfig
) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(files[0] || null);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    getDisplayTime(files[0] || null, config)
  );

  // Use refs to avoid recreating callbacks when files/config change
  const filesRef = useRef(files);
  const configRef = useRef(config);
  
  useEffect(() => {
    filesRef.current = files;
    configRef.current = config;
  }, [files, config]);

  // Track previous files to detect actual changes
  const prevFilesIdsRef = useRef<string>('');
  
  useEffect(() => {
    const currentFilesIds = files.map(f => f.id).join(',');
    const filesChanged = prevFilesIdsRef.current !== currentFilesIds;
    
    // Only reset if files actually changed (different IDs or length)
    if (filesChanged) {
      if (files.length > 0) {
        // Check if current index is still valid
        setCurrentIndex(prev => {
          if (prev >= files.length) {
            // Index out of bounds, reset to 0
            const media = files[0];
            setCurrentMedia(media || null);
            setTimeRemaining(getDisplayTime(media || null, config));
            return 0;
          }
          // Index is still valid, update media for current index
          const media = files[prev];
          setCurrentMedia(media || null);
          setTimeRemaining(getDisplayTime(media || null, config));
          return prev;
        });
      } else {
        setCurrentIndex(0);
        setCurrentMedia(null);
        setTimeRemaining(0);
      }
      prevFilesIdsRef.current = currentFilesIds;
    }
  }, [files, config]);

  const updateCurrentMedia = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    const currentConfig = configRef.current;
    const media = currentFiles[index];
    setCurrentIndex(index);
    setCurrentMedia(media || null);
    setTimeRemaining(getDisplayTime(media || null, currentConfig));
  }, []);

  const nextSlide = useCallback(() => {
    const currentFiles = filesRef.current;
    if (currentFiles.length === 0) return;
    
    setCurrentIndex(prev => {
      const nextIndex = (prev + 1) % currentFiles.length;
      // Update all state together
      const media = currentFiles[nextIndex];
      const currentConfig = configRef.current;
      setCurrentMedia(media || null);
      setTimeRemaining(getDisplayTime(media || null, currentConfig));
      return nextIndex;
    });
  }, []);

  const previousSlide = useCallback(() => {
    const currentFiles = filesRef.current;
    if (currentFiles.length === 0) return;
    
    setCurrentIndex(prev => {
      const prevIndex = prev === 0 ? currentFiles.length - 1 : prev - 1;
      // Update all state together
      const media = currentFiles[prevIndex];
      const currentConfig = configRef.current;
      setCurrentMedia(media || null);
      setTimeRemaining(getDisplayTime(media || null, currentConfig));
      return prevIndex;
    });
  }, []);

  const goToSlide = useCallback((index: number) => {
    const currentFiles = filesRef.current;
    if (index >= 0 && index < currentFiles.length) {
      updateCurrentMedia(index);
    }
  }, [updateCurrentMedia]);

  const reset = useCallback(() => {
    updateCurrentMedia(0);
  }, [updateCurrentMedia]);

  return {
    currentIndex,
    currentMedia,
    timeRemaining,
    setTimeRemaining,
    nextSlide,
    previousSlide,
    goToSlide,
    reset,
  };
}

