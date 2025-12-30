import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaFile, MediaFilter, SlideshowConfig } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
import { filterMediaFiles, getDisplayTime } from '@/utils/mediaUtils';
import { useSlideshowNavigation } from '@/hooks/useSlideshowNavigation';
import { useMediaShuffle } from '@/hooks/useMediaShuffle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSlideshowTimer } from '@/hooks/useSlideshowTimer';
import { useMediaFilter } from '@/hooks/useMediaFilter';
import { platformService } from '@/services/PlatformService';
import MediaDisplay from './MediaDisplay';
import Controls from './Controls';
import ConfigPanel from './ConfigPanel';

interface SlideshowProps {
  mediaFiles: MediaFile[];
  config?: Partial<typeof DEFAULT_CONFIG>;
  onChangeFolder?: () => void;
  onClearSavedFolder?: () => void;
  isElectron?: boolean;
  mediaFilter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({
  mediaFiles,
  config = DEFAULT_CONFIG,
  onChangeFolder,
  onClearSavedFolder,
  isElectron = false,
  mediaFilter,
  onFilterChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  const { filter, getFilteredFiles } = useMediaFilter(mediaFilter);
  const filteredFiles = useMemo(() => getFilteredFiles(mediaFiles), [mediaFiles, filter, getFilteredFiles]);
  const { shuffledFiles, isShuffled, shuffle, reset: resetShuffle } = useMediaShuffle(filteredFiles);

  const {
    currentIndex,
    currentMedia,
    timeRemaining,
    setTimeRemaining,
    nextSlide,
    previousSlide,
    reset: resetNavigation,
  } = useSlideshowNavigation(shuffledFiles, slideshowConfig);

  // Reset navigation when files change - use a ref to track previous values
  const prevFilesLengthRef = React.useRef<number>(mediaFiles.length);
  const prevFilterRef = React.useRef<MediaFilter>(filter);
  const resetShuffleRef = React.useRef(resetShuffle);
  const resetNavigationRef = React.useRef(resetNavigation);
  
  // Keep refs updated
  useEffect(() => {
    resetShuffleRef.current = resetShuffle;
    resetNavigationRef.current = resetNavigation;
  }, [resetShuffle, resetNavigation]);
  
  useEffect(() => {
    const filesLengthChanged = prevFilesLengthRef.current !== mediaFiles.length;
    const filterChanged = prevFilterRef.current !== filter;
    
    if (filesLengthChanged || filterChanged) {
      resetShuffleRef.current();
      resetNavigationRef.current();
      prevFilesLengthRef.current = mediaFiles.length;
      prevFilterRef.current = filter;
    }
  }, [mediaFiles.length, filter]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSettings = useCallback(() => {
    setIsConfigPanelOpen(true);
  }, []);

  const handleConfigChange = useCallback((newConfig: SlideshowConfig) => {
    setSlideshowConfig(newConfig);
    if (currentMedia) {
      const newDisplayTime = getDisplayTime(currentMedia, newConfig);
      setTimeRemaining(newDisplayTime);
    }
  }, [currentMedia, setTimeRemaining]);

  const openInFinder = useCallback(async () => {
    if (!currentMedia) return;

    try {
      const electronService = platformService.getElectronService();
      if (electronService) {
        const data = await electronService.openInFinder(currentMedia.path);
        if (!data.success) {
          console.error('Failed to open file in Finder:', data.error);
        }
      } else {
        console.log('Open in Finder not supported in web mode');
      }
    } catch (error) {
      console.error('Error opening file in Finder:', error);
    }
  }, [currentMedia]);

  useKeyboardShortcuts({
    onPlayPause: togglePlayPause,
    onPrevious: previousSlide,
    onNext: nextSlide,
    onShuffle: shuffle,
    onFilter: () => onFilterChange(filter === MediaFilter.ALL ? MediaFilter.PHOTOS_ONLY : filter === MediaFilter.PHOTOS_ONLY ? MediaFilter.VIDEOS_ONLY : MediaFilter.ALL),
    onOpenFinder: openInFinder,
  });

  useSlideshowTimer({
    isPlaying,
    currentMedia,
    timeRemaining,
    onTimeRemainingChange: setTimeRemaining,
    onTimerExpired: nextSlide,
  });

  if (!currentMedia) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No media files found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black">
      <MediaDisplay
        media={currentMedia}
        onVideoEnd={nextSlide}
        config={slideshowConfig}
        isPlaying={isPlaying}
      />

      <Controls
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onShuffle={shuffle}
        onSettings={handleSettings}
        onOpenInFinder={openInFinder}
        currentIndex={currentIndex}
        totalFiles={shuffledFiles.length}
        timeRemaining={timeRemaining}
        mediaType={currentMedia.type}
        isShuffled={isShuffled}
        onChangeFolder={onChangeFolder}
        onClearSavedFolder={onClearSavedFolder}
        isElectron={isElectron}
        mediaFilter={filter}
        onFilterChange={onFilterChange}
      />

      <ConfigPanel
        config={slideshowConfig}
        onConfigChange={handleConfigChange}
        isOpen={isConfigPanelOpen}
        onClose={() => setIsConfigPanelOpen(false)}
      />
    </div>
  );
};

export default Slideshow;
