import { useEffect } from 'react';
import { MediaType } from '@/types/media';
import { MediaFile } from '@/types/media';

interface SlideshowTimerConfig {
  isPlaying: boolean;
  currentMedia: MediaFile | null;
  timeRemaining: number;
  onTimeRemainingChange: (time: number) => void;
  onTimerExpired: () => void;
}

export function useSlideshowTimer(config: SlideshowTimerConfig) {
  const { isPlaying, currentMedia, timeRemaining, onTimeRemainingChange, onTimerExpired } = config;

  useEffect(() => {
    // Only run timer for photos
    if (!isPlaying || !currentMedia || currentMedia.type !== MediaType.PHOTO) {
      return;
    }

    const timer = setInterval(() => {
      if (timeRemaining <= 1) {
        onTimerExpired();
      } else {
        onTimeRemainingChange(timeRemaining - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentMedia, timeRemaining, onTimeRemainingChange, onTimerExpired]);
}

