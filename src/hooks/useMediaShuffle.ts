import { useState, useCallback, useEffect, useRef } from 'react';
import { MediaFile } from '@/types/media';
import { shuffleArray } from '@/utils/mediaLoader';

export function useMediaShuffle(originalFiles: MediaFile[]) {
  const [shuffledFiles, setShuffledFiles] = useState<MediaFile[]>(originalFiles);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const prevFilesRef = useRef(originalFiles);

  useEffect(() => {
    // Only update if files actually changed (reference comparison)
    if (prevFilesRef.current !== originalFiles) {
      // Always update shuffledFiles when originalFiles changes, regardless of shuffle state
      // This ensures we're always working with the current file list
      if (!isShuffled) {
        setShuffledFiles([...originalFiles]);
      } else {
        // If shuffled, re-shuffle with new files
        setShuffledFiles(shuffleArray(originalFiles));
      }
      prevFilesRef.current = originalFiles;
    }
  }, [originalFiles, isShuffled]);

  const shuffle = useCallback(() => {
    setShuffledFiles(prev => {
      if (isShuffled) {
        // Return to ordered mode
        setIsShuffled(false);
        return [...originalFiles];
      } else {
        // Enable shuffle mode
        setIsShuffled(true);
        return shuffleArray(originalFiles);
      }
    });
  }, [isShuffled, originalFiles]);

  const reset = useCallback(() => {
    setShuffledFiles([...originalFiles]);
    setIsShuffled(false);
  }, [originalFiles]);

  return {
    shuffledFiles,
    isShuffled,
    shuffle,
    reset,
  };
}

