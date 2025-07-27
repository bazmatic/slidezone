'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, SlideshowState } from '@/types/media';
import { DEFAULT_CONFIG } from '@/constants/config';
import MediaDisplay from './MediaDisplay';
import Controls from './Controls';

interface SlideshowProps {
  mediaFiles: MediaFile[];
  config?: Partial<typeof DEFAULT_CONFIG>;
}

const Slideshow: React.FC<SlideshowProps> = ({ 
  mediaFiles, 
  config = DEFAULT_CONFIG 
}) => {
  const [state, setState] = useState<SlideshowState>({
    currentIndex: 0,
    isPlaying: true,
    currentMedia: null,
    timeRemaining: 0,
  });

  const [shuffledFiles, setShuffledFiles] = useState<MediaFile[]>([]);

  // Shuffle media files on mount and when files change
  useEffect(() => {
    const shuffled = [...mediaFiles].sort(() => Math.random() - 0.5);
    setShuffledFiles(shuffled);
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      currentMedia: shuffled[0] || null,
      timeRemaining: shuffled[0]?.type === MediaType.PHOTO 
        ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
        : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds,
    }));
  }, [mediaFiles, config]);

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
    const newShuffled = [...shuffledFiles].sort(() => Math.random() - 0.5);
    setShuffledFiles(newShuffled);
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      currentMedia: newShuffled[0] || null,
      timeRemaining: newShuffled[0]?.type === MediaType.PHOTO 
        ? config.photoDisplaySeconds || DEFAULT_CONFIG.photoDisplaySeconds
        : config.videoDisplaySeconds || DEFAULT_CONFIG.videoDisplaySeconds,
    }));
  }, [shuffledFiles, config]);

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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause, previousSlide, nextSlide, shuffle]);

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
      />
      
      <Controls
        isPlaying={state.isPlaying}
        onPlayPause={togglePlayPause}
        onNext={nextSlide}
        onPrevious={previousSlide}
        onShuffle={shuffle}
        currentIndex={state.currentIndex}
        totalFiles={shuffledFiles.length}
        timeRemaining={state.timeRemaining}
        mediaType={state.currentMedia.type}
      />
    </div>
  );
};

export default Slideshow; 