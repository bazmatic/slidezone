import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaFile, MediaFilter, SlideshowConfig } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
import { filterMediaFiles, getDisplayTime, getNextFilter } from '@/utils/mediaUtils';
import { useSlideshowNavigation } from '@/hooks/useSlideshowNavigation';
import { useMediaShuffle } from '@/hooks/useMediaShuffle';
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
  const [promptMetadata, setPromptMetadata] = useState<{ promptText: string } | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfig>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  // Filter media files directly using the prop
  const filteredFiles = useMemo(() => filterMediaFiles(mediaFiles, mediaFilter), [mediaFiles, mediaFilter]);
  const { shuffledFiles, isShuffled, shuffle } = useMediaShuffle(filteredFiles);

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
  const prevFilterRef = React.useRef<MediaFilter>(mediaFilter);
  const resetNavigationRef = React.useRef(resetNavigation);
  
  // Keep refs updated
  useEffect(() => {
    resetNavigationRef.current = resetNavigation;
  }, [resetNavigation]);
  
  useEffect(() => {
    const filesLengthChanged = prevFilesLengthRef.current !== mediaFiles.length;
    const filterChanged = prevFilterRef.current !== mediaFilter;
    
    if (filesLengthChanged || filterChanged) {
      console.log(`[Slideshow] Filter or files changed: filter=${mediaFilter}, filesLength=${mediaFiles.length}, filteredLength=${filteredFiles.length}`);
      
      // When filter changes, preserve shuffle state - useMediaShuffle will automatically
      // re-shuffle the new filtered list if shuffle is active, or update to ordered if not
      // We only need to reset navigation to start from the beginning
      resetNavigationRef.current();
      prevFilesLengthRef.current = mediaFiles.length;
      prevFilterRef.current = mediaFilter;
    }
  }, [mediaFiles.length, mediaFilter, filteredFiles.length]);

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
        onShuffle={shuffle}
        onSettings={handleSettings}
        onOpenInFinder={openInFinder}
        currentIndex={currentIndex}
        totalFiles={shuffledFiles.length}
        timeRemaining={timeRemaining}
        mediaType={currentMedia.type}
        isShuffled={isShuffled}
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
