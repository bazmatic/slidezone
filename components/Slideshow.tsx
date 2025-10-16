'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, SlideshowState, MediaFilter, SlideshowConfig } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
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
  onFilterChange
}) => {
  console.log('Slideshow component - mediaFiles.length:', mediaFiles?.length, 'onChangeFolder:', !!onChangeFolder, 'isElectron:', isElectron);
  const [state, setState] = useState<SlideshowState>({
    currentIndex: 0,
    isPlaying: true,
    currentMedia: null,
    timeRemaining: 0,
  });

  const [shuffledFiles, setShuffledFiles] = useState<MediaFile[]>([]);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
  const [slideshowConfig, setSlideshowConfig] = useState<SlideshowConfig>({
    ...DEFAULT_CONFIG,
    ...config
  });

  // Filter media files based on current filter
  const getFilteredMediaFiles = useCallback(() => {
    switch (mediaFilter) {
      case MediaFilter.PHOTOS_ONLY:
        return mediaFiles.filter(file => file.type === MediaType.PHOTO);
      case MediaFilter.VIDEOS_ONLY:
        return mediaFiles.filter(file => file.type === MediaType.VIDEO);
      case MediaFilter.ALL:
      default:
        return mediaFiles;
    }
  }, [mediaFiles, mediaFilter]);

  // Initialize media files on mount and when files change
  useEffect(() => {
    const filteredFiles = getFilteredMediaFiles();
    // Start with files in order (by date modified, newest first)
    setShuffledFiles([...filteredFiles]);
    setIsShuffled(false);
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      currentMedia: filteredFiles[0] || null,
      timeRemaining: filteredFiles[0]?.type === MediaType.PHOTO 
        ? slideshowConfig.photoDisplaySeconds
        : slideshowConfig.videoDisplaySeconds,
    }));
  }, [mediaFiles, slideshowConfig, getFilteredMediaFiles]);

  const nextSlide = useCallback(() => {
    console.log('nextSlide called, current state:', state.currentIndex, 'total files:', shuffledFiles.length);
    setState(prev => {
      const nextIndex = (prev.currentIndex + 1) % shuffledFiles.length;
      const nextMedia = shuffledFiles[nextIndex];
      const displayTime = nextMedia?.type === MediaType.PHOTO
        ? slideshowConfig.photoDisplaySeconds
        : slideshowConfig.videoDisplaySeconds;

      console.log('Moving to next slide:', nextIndex, 'media:', nextMedia?.name);

      return {
        ...prev,
        currentIndex: nextIndex,
        currentMedia: nextMedia,
        timeRemaining: displayTime,
      };
    });
  }, [shuffledFiles, slideshowConfig, state.currentIndex]);

  const previousSlide = useCallback(() => {
    console.log('previousSlide called, current state:', state.currentIndex, 'total files:', shuffledFiles.length);
    setState(prev => {
      const prevIndex = prev.currentIndex === 0
        ? shuffledFiles.length - 1
        : prev.currentIndex - 1;
      const prevMedia = shuffledFiles[prevIndex];
      const displayTime = prevMedia?.type === MediaType.PHOTO
        ? slideshowConfig.photoDisplaySeconds
        : slideshowConfig.videoDisplaySeconds;

      console.log('Moving to previous slide:', prevIndex, 'media:', prevMedia?.name);

      return {
        ...prev,
        currentIndex: prevIndex,
        currentMedia: prevMedia,
        timeRemaining: displayTime,
      };
    });
  }, [shuffledFiles, slideshowConfig, state.currentIndex]);

  const togglePlayPause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const shuffle = useCallback(() => {
    const filteredFiles = getFilteredMediaFiles();
    if (isShuffled) {
      // Return to ordered mode (by date modified, newest first)
      setShuffledFiles([...filteredFiles]);
      setIsShuffled(false);
      setState(prev => ({
        ...prev,
        currentIndex: 0,
        currentMedia: filteredFiles[0] || null,
        timeRemaining: filteredFiles[0]?.type === MediaType.PHOTO 
          ? slideshowConfig.photoDisplaySeconds
          : slideshowConfig.videoDisplaySeconds,
      }));
    } else {
      // Enable shuffle mode
      const newShuffled = [...filteredFiles].sort(() => Math.random() - 0.5);
      setShuffledFiles(newShuffled);
      setIsShuffled(true);
      setState(prev => ({
        ...prev,
        currentIndex: 0,
        currentMedia: newShuffled[0] || null,
        timeRemaining: newShuffled[0]?.type === MediaType.PHOTO 
          ? slideshowConfig.photoDisplaySeconds
          : slideshowConfig.videoDisplaySeconds,
      }));
    }
  }, [isShuffled, getFilteredMediaFiles, slideshowConfig]);

  const openInFinder = useCallback(async () => {
    if (!state.currentMedia) return;

    try {
      // Use the actual file path directly
      const filePath = state.currentMedia.path;
      console.log('Opening in Finder:', filePath);

      const response = await fetch('/api/open-in-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Failed to open file in Finder:', data.error);
      } else if (data.message) {
        console.log('Finder open result:', data.message);
      }
    } catch (error) {
      console.error('Error opening file in Finder:', error);
    }
  }, [state.currentMedia]);

  const handleSettings = useCallback(() => {
    setIsConfigPanelOpen(true);
  }, []);

  const handleConfigChange = useCallback((newConfig: SlideshowConfig) => {
    setSlideshowConfig(newConfig);
    // Update current media display time if needed
    if (state.currentMedia) {
      const newDisplayTime = state.currentMedia.type === MediaType.PHOTO 
        ? newConfig.photoDisplaySeconds
        : newConfig.videoDisplaySeconds;
      setState(prev => ({
        ...prev,
        timeRemaining: newDisplayTime
      }));
    }
  }, [state.currentMedia]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      console.log('Keyboard event:', event.key, 'Code:', event.code);

      switch (event.key) {
        case ' ':
          event.preventDefault();
          console.log('Space: toggling play/pause');
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          console.log('ArrowLeft: going to previous slide');
          previousSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          console.log('ArrowRight: going to next slide');
          nextSlide();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          console.log('S: shuffling slides');
          shuffle();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          console.log('F: cycling filter');
          const nextFilter = mediaFilter === MediaFilter.ALL
            ? MediaFilter.PHOTOS_ONLY
            : mediaFilter === MediaFilter.PHOTOS_ONLY
            ? MediaFilter.VIDEOS_ONLY
            : MediaFilter.ALL;
          onFilterChange(nextFilter);
          break;
        case 'o':
        case 'O':
          event.preventDefault();
          console.log('O: opening in Finder');
          openInFinder();
          break;
      }
    };

    console.log('Setting up global keyboard shortcuts');
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      console.log('Removing global keyboard shortcuts');
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [togglePlayPause, previousSlide, nextSlide, shuffle, openInFinder, mediaFilter, onFilterChange]);

  // Timer effect for photos
  useEffect(() => {
    if (!state.isPlaying || !state.currentMedia || state.currentMedia.type !== MediaType.PHOTO) {
      return;
    }

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          nextSlide();
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isPlaying, state.currentMedia, state.timeRemaining, nextSlide]);

  if (!state.currentMedia) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No media files found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black">
      <MediaDisplay 
        media={state.currentMedia}
        onVideoEnd={nextSlide}
        config={slideshowConfig}
        isPlaying={state.isPlaying}
      />
      
      <Controls
        isPlaying={state.isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onShuffle={shuffle}
        onSettings={handleSettings}
        onOpenInFinder={openInFinder}
        currentIndex={state.currentIndex}
        totalFiles={shuffledFiles.length}
        timeRemaining={state.timeRemaining}
        mediaType={state.currentMedia.type}
        isShuffled={isShuffled}
        onChangeFolder={onChangeFolder}
        onClearSavedFolder={onClearSavedFolder}
        isElectron={isElectron}
        mediaFilter={mediaFilter}
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