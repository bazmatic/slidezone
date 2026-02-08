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
import { Modal } from './ui/Modal';

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
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
  const [promptMetadata, setPromptMetadata] = useState<{ promptText: string } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
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
    goToMedia,
    reset: resetNavigation,
  } = useSlideshowNavigation(orderedFiles, slideshowConfig);

  // When files or filter change: reset to start. When only display order changes: keep current file selected.
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
        resetNavigationRef.current();
      } else if (displayOrderChanged) {
        if (currentMedia !== null) {
          goToMedia(currentMedia);
        } else {
          resetNavigationRef.current();
        }
      }
      prevFilesLengthRef.current = mediaFiles.length;
      prevFilterRef.current = mediaFilter;
      prevDisplayOrderRef.current = displayOrder;
    }
  }, [mediaFiles.length, mediaFilter, displayOrder, filteredFiles.length, currentMedia, goToMedia]);

  useEffect(() => {
    if (!currentMedia || !isElectron) {
      setPromptMetadata(null);
      setIsPromptModalOpen(false);
      return;
    }
    const electronService = platformService.getElectronService();
    if (!electronService) {
      setPromptMetadata(null);
      return;
    }
    let cancelled = false;
    electronService.getMediaMetadata(currentMedia.path).then((result) => {
      if (cancelled) return;
      if (result.hasPrompt && result.promptText) {
        setPromptMetadata({ promptText: result.promptText });
      } else {
        setPromptMetadata(null);
        setIsPromptModalOpen(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setPromptMetadata(null);
        setIsPromptModalOpen(false);
      }
    });
    return () => { cancelled = true; };
  }, [currentMedia, isElectron]);

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

      {promptMetadata && (
        <button
          type="button"
          onClick={() => setIsPromptModalOpen(true)}
          className="absolute left-4 bottom-4 z-30 px-3 py-2 rounded bg-black/60 text-white/80 text-sm hover:bg-black/80 hover:text-white transition-colors"
          title="Show prompt"
        >
          Prompt
        </button>
      )}

      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        title="Prompt"
        className="max-w-2xl"
      >
        {promptMetadata && (
          <pre className="whitespace-pre-wrap break-words text-sm text-white/90 max-h-[70vh] overflow-auto font-sans">
            {promptMetadata.promptText}
          </pre>
        )}
      </Modal>
    </div>
  );
};

export default Slideshow;
