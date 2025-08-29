'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, SlideshowState, MediaFilter } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
import MediaDisplay from './MediaDisplay';
import Controls from './Controls';

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
  const [state, setState] = useState<SlideshowState>({
    currentIndex: 0,
    isPlaying: true,
    currentMedia: null,
    timeRemaining: 0,
  });

  const [shuffledFiles, setShuffledFiles] = useState<MediaFile[]>([]);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

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
        ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
        : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds,
    }));
  }, [mediaFiles, config, getFilteredMediaFiles]);

  const nextSlide = useCallback(() => {
    setState(prev => {
      const nextIndex = (prev.currentIndex + 1) % shuffledFiles.length;
      const nextMedia = shuffledFiles[nextIndex];
      const displayTime = nextMedia?.type === MediaType.PHOTO 
        ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
        : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds;
      
      return {
        ...prev,
        currentIndex: nextIndex,
        currentMedia: nextMedia,
        timeRemaining: displayTime,
      };
    });
  }, [shuffledFiles, config]);

  const previousSlide = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.currentIndex === 0 
        ? shuffledFiles.length - 1 
        : prev.currentIndex - 1;
      const prevMedia = shuffledFiles[prevIndex];
      const displayTime = prevMedia?.type === MediaType.PHOTO 
        ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
        : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds;
      
      return {
        ...prev,
        currentIndex: prevIndex,
        currentMedia: prevMedia,
        timeRemaining: displayTime,
      };
    });
  }, [shuffledFiles, config]);

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
          ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
          : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds,
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
          ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
          : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds,
      }));
    }
  }, [isShuffled, getFilteredMediaFiles, config]);

  const openInFinder = useCallback(async () => {
    if (!state.currentMedia) return;

    try {
      // Extract filename from the path (remove /media/ prefix)
      const filename = state.currentMedia.path.replace('/media/', '');
      
      const response = await fetch('/api/open-in-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to open file in Finder:', data.error);
      }
    } catch (error) {
      console.error('Error opening file in Finder:', error);
    }
  }, [state.currentMedia]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previousSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextSlide();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          shuffle();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
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
          openInFinder();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
        config={config}
        isPlaying={state.isPlaying}
      />
      
      <Controls
        isPlaying={state.isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onShuffle={shuffle}
        onSettings={() => {}} // TODO: Add settings functionality
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
    </div>
  );
};

export default Slideshow; 