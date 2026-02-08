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

interface OrderCache {
  none: MediaFile[];
  random: MediaFile[];
  alphabetical: MediaFile[];
  reverseAlphabetical: MediaFile[];
}

function buildOrderCache(files: MediaFile[]): OrderCache {
  return {
    none: [...files],
    random: shuffleArray([...files]),
    alphabetical: sortAlphabetical(files),
    reverseAlphabetical: sortReverseAlphabetical(files),
  };
}

export function useDisplayOrder(originalFiles: MediaFile[]) {
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder>(DisplayOrder.NONE);
  const [orderedFiles, setOrderedFiles] = useState<MediaFile[]>(() => [...originalFiles]);
  const cacheRef = useRef<OrderCache | null>(null);
  const originalFilesRef = useRef<MediaFile[]>(originalFiles);

  // Rebuild cache when file list identity changes; then apply current display order from cache.
  useEffect(() => {
    if (originalFiles !== originalFilesRef.current) {
      originalFilesRef.current = originalFiles;
      cacheRef.current = buildOrderCache(originalFiles);
    }
    const cache = cacheRef.current ?? buildOrderCache(originalFiles);
    if (cacheRef.current === null) cacheRef.current = cache;

    switch (displayOrder) {
      case DisplayOrder.NONE:
        setOrderedFiles(cache.none);
        break;
      case DisplayOrder.RANDOM:
        setOrderedFiles(cache.random);
        break;
      case DisplayOrder.ALPHABETICAL:
        setOrderedFiles(cache.alphabetical);
        break;
      case DisplayOrder.REVERSE_ALPHABETICAL:
        setOrderedFiles(cache.reverseAlphabetical);
        break;
      default:
        setOrderedFiles(cache.none);
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
