import { useState, useCallback } from 'react';
import { MediaFilter, MediaFile } from '@/types/media';
import { getNextFilter, filterMediaFiles } from '@/utils/mediaUtils';

export function useMediaFilter(initialFilter: MediaFilter = MediaFilter.ALL) {
  const [filter, setFilter] = useState<MediaFilter>(initialFilter);

  const cycleFilter = useCallback(() => {
    setFilter(prev => getNextFilter(prev));
  }, []);

  const setFilterValue = useCallback((newFilter: MediaFilter) => {
    setFilter(newFilter);
  }, []);

  const getFilteredFiles = useCallback((files: MediaFile[]): MediaFile[] => {
    return filterMediaFiles(files, filter);
  }, [filter]);

  return {
    filter,
    cycleFilter,
    setFilter: setFilterValue,
    getFilteredFiles,
  };
}

