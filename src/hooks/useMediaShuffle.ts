import { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { MediaFile, DisplayOrder } from '@/types/media';
import { shuffleArray } from '@/utils/mediaLoader';
import { getNextDisplayOrder } from '@/utils/mediaUtils';

function sortAlphabetical(files: MediaFile[]): MediaFile[] {
  return [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

function sortReverseAlphabetical(files: MediaFile[]): MediaFile[] {
  return [...files].sort((a, b) =>
    b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
  );
}

interface SortCache {
  alphabetical: MediaFile[] | null;
  reverseAlphabetical: MediaFile[] | null;
  originalFilesRef: MediaFile[] | null;
}

export function useDisplayOrder(originalFiles: MediaFile[]) {
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder>(DisplayOrder.NONE);
  const [orderedFiles, setOrderedFiles] = useState<MediaFile[]>(() => [...originalFiles]);
  const cacheRef = useRef<SortCache>({
    alphabetical: null,
    reverseAlphabetical: null,
    originalFilesRef: null,
  });

  // Compute orderedFiles after paint so the icon updates first; use cache when available.
  useEffect(() => {
    const cache = cacheRef.current;
    if (originalFiles !== cache.originalFilesRef) {
      cache.alphabetical = null;
      cache.reverseAlphabetical = null;
      cache.originalFilesRef = originalFiles;
    }

    switch (displayOrder) {
      case DisplayOrder.NONE:
        setOrderedFiles([...originalFiles]);
        break;
      case DisplayOrder.RANDOM:
        setOrderedFiles(shuffleArray(originalFiles));
        break;
      case DisplayOrder.ALPHABETICAL:
        if (cache.alphabetical !== null) {
          setOrderedFiles(cache.alphabetical);
        } else {
          const sorted = sortAlphabetical(originalFiles);
          cache.alphabetical = sorted;
          setOrderedFiles(sorted);
        }
        break;
      case DisplayOrder.REVERSE_ALPHABETICAL:
        if (cache.reverseAlphabetical !== null) {
          setOrderedFiles(cache.reverseAlphabetical);
        } else {
          const sorted = sortReverseAlphabetical(originalFiles);
          cache.reverseAlphabetical = sorted;
          setOrderedFiles(sorted);
        }
        break;
      default:
        setOrderedFiles([...originalFiles]);
    }
  }, [displayOrder, originalFiles]);

  const cycleDisplayOrder = useCallback(() => {
    flushSync(() => {
      setDisplayOrder((prev) => getNextDisplayOrder(prev));
    });
  }, []);

  const reset = useCallback(() => {
    setDisplayOrder(DisplayOrder.NONE);
  }, []);

  return {
    orderedFiles,
    displayOrder,
    cycleDisplayOrder,
    reset,
  };
}
