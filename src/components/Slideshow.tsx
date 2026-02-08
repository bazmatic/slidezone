import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaFile, MediaFilter, SlideshowConfig, DisplayOrder } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
import { filterMediaFiles, getDisplayTime, getNextFilter } from '@/utils/mediaUtils';
import { useSlideshowNavigation } from '@/hooks/useSlideshowNavigation';
import { useDisplayOrder } from '@/hooks/useMediaShuffle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSlideshowTimer } from '@/hooks/useSlideshowTimer';
import { platformService } from '@/services/PlatformService';
import MediaDisplay from './MediaDisplay';
import Controls from './Controls';
import ConfigPanel from './ConfigPanel';

interface SlideshowProps {
  mediaFiles: MediaFile[];
  config?: Partial<typeof DEFAULT_CONFIG>;
  onConfigChange?: (config: SlideshowConfig) => void;
  selectedFolder?: string | null;
  onChangeFolder?: () => void;
  onClearSavedFolder?: () => void;
  isElectron?: boolean;
  mediaFilter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({
  mediaFiles,
  config = DEFAULT_CONFIG,
  onConfigChange,
  selectedFolder,
  onChangeFolder,
  onClearSavedFolder,
  isElectron = false,
  mediaFilter,
  onFilterChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  useEffect(() => {
    setSlideshowConfig({ ...DEFAULT_CONFIG, ...config });
  }, [config]);

  // Filter media files directly using the prop
  const filteredFiles = useMemo(() => filterMediaFiles(mediaFiles, mediaFilter), [mediaFiles, mediaFilter]);
  const { orderedFiles, displayOrder, cycleDisplayOrder } = useDisplayOrder(filteredFiles);

  const {
    currentIndex,
    currentMedia,
    timeRemaining,
    setTimeRemaining,
    nextSlide,
    previousSlide,
    reset: resetNavigation,
  } = useSlideshowNavigation(orderedFiles, slideshowConfig);

  // Reset navigation when files, filter, or display order change
  const prevFilesLengthRef = React.useRef<number>(mediaFiles.length);
  const prevFilterRef = React.useRef<MediaFilter>(mediaFilter);
  const prevDisplayOrderRef = React.useRef<DisplayOrder>(displayOrder);
  const resetNavigationRef = React.useRef(resetNavigation);

  useEffect(() => {
    resetNavigationRef.current = resetNavigation;
  }, [resetNavigation]);

  useEffect(() => {
    const filesLengthChanged = prevFilesLengthRef.current !== mediaFiles.length;
    const filterChanged = prevFilterRef.current !== mediaFilter;
    const displayOrderChanged = prevDisplayOrderRef.current !== displayOrder;

    if (filesLengthChanged || filterChanged || displayOrderChanged) {
      if (filesLengthChanged || filterChanged) {
        console.log(`[Slideshow] Filter or files changed: filter=${mediaFilter}, filesLength=${mediaFiles.length}, filteredLength=${filteredFiles.length}`);
      }
      resetNavigationRef.current();
      prevFilesLengthRef.current = mediaFiles.length;
      prevFilterRef.current = mediaFilter;
      prevDisplayOrderRef.current = displayOrder;
    }
  }, [mediaFiles.length, mediaFilter, displayOrder, filteredFiles.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleSettings = useCallback(() => {
    setIsConfigPanelOpen(true);
  }, []);

  const handleConfigChange = useCallback((newConfig: SlideshowConfig) => {
    setSlideshowConfig(newConfig);
    onConfigChange?.(newConfig);
    if (currentMedia) {
      const newDisplayTime = getDisplayTime(currentMedia, newConfig);
      setTimeRemaining(newDisplayTime);
    }
  }, [currentMedia, setTimeRemaining, onConfigChange]);

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
    onCycleDisplayOrder: cycleDisplayOrder,
    onFilter: () => {
      onFilterChange(getNextFilter(mediaFilter));
    },
    onOpenFinder: openInFinder,
    onMuteToggle: toggleMute,
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
        isMuted={isMuted}
      />

      <Controls
        isPlaying={isPlaying}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        onPlayPause={togglePlayPause}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onCycleDisplayOrder={cycleDisplayOrder}
        onSettings={handleSettings}
        onOpenInFinder={openInFinder}
        currentIndex={currentIndex}
        totalFiles={orderedFiles.length}
        timeRemaining={timeRemaining}
        mediaType={currentMedia.type}
        displayOrder={displayOrder}
        mediaFilter={mediaFilter}
        onFilterChange={onFilterChange}
      />

      <ConfigPanel
        config={slideshowConfig}
        onConfigChange={handleConfigChange}
        isOpen={isConfigPanelOpen}
        onClose={() => setIsConfigPanelOpen(false)}
        isElectron={isElectron}
        selectedFolder={selectedFolder}
        onChangeFolder={onChangeFolder}
        onClearSavedFolder={onClearSavedFolder}
      />
    </div>
  );
};

export default Slideshow;
