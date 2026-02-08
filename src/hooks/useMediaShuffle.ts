import { useState, useCallback, useMemo } from 'react';
import { MediaFile, DisplayOrder } from '@/types/media';
import { shuffleArray } from '@/utils/mediaLoader';
import { getNextDisplayOrder } from '@/utils/mediaUtils';

export function useDisplayOrder(originalFiles: MediaFile[]) {
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder>(DisplayOrder.NONE);

  const orderedFiles = useMemo((): MediaFile[] => {
    switch (displayOrder) {
      case DisplayOrder.NONE:
        return [...originalFiles];
      case DisplayOrder.RANDOM:
        return shuffleArray(originalFiles);
      case DisplayOrder.ALPHABETICAL:
        return [...originalFiles].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      case DisplayOrder.REVERSE_ALPHABETICAL:
        return [...originalFiles].sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
        );
      default:
        return [...originalFiles];
    }
  }, [originalFiles, displayOrder]);

  const cycleDisplayOrder = useCallback(() => {
    setDisplayOrder((prev) => getNextDisplayOrder(prev));
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
