import { useRef, useState, useEffect } from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { SlideshowConfig } from '@/types/media';

interface VideoPlayerConfig {
  media: MediaFile;
  isPlaying: boolean;
  config: SlideshowConfig;
  onVideoEnd: () => void;
}

export function useVideoPlayer(config: VideoPlayerConfig) {
  const { media, isPlaying, config: slideshowConfig, onVideoEnd } = config;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIsActuallyPlaying, setVideoIsActuallyPlaying] = useState<boolean>(false);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const currentDurationRef = useRef<number>(slideshowConfig.videoDisplaySeconds || 10);

  // Reset internal state when media changes. Do not set currentTime or load() here:
  // the element may still be showing the previous video, so that would flash the
  // previous video's first frame before the new src (from parent) takes effect.
  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current) {
      const video = videoRef.current;

      setVideoIsActuallyPlaying(false);

      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }

      videoStartTimeRef.current = null;
      currentDurationRef.current = slideshowConfig.videoDisplaySeconds || 10;

      video.pause();
    }
  }, [media, slideshowConfig.videoDisplaySeconds]);

  // Handle play/pause
  useEffect(() => {
    if (media.type !== MediaType.VIDEO || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    
    // Clear any existing timer first
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    
    if (isPlaying) {
      // Wait for video to be ready before playing
      const tryPlay = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          video.play().catch(error => {
            console.error('[useVideoPlayer] Error playing video:', error);
            console.error('[useVideoPlayer] Video src:', video.src);
            console.error('[useVideoPlayer] Video readyState:', video.readyState);
          });
        } else {
          // Wait for video to load
          const handleCanPlayOnce = () => {
            video.play().catch(error => {
              console.error('[useVideoPlayer] Error playing video after canplay:', error);
            });
            video.removeEventListener('canplay', handleCanPlayOnce);
          };
          video.addEventListener('canplay', handleCanPlayOnce, { once: true });
        }
      };
      
      tryPlay();
      
      // Record start time and set initial timer with current config value
      videoStartTimeRef.current = Date.now();
      const maxDuration = slideshowConfig.videoDisplaySeconds || 10;
      currentDurationRef.current = maxDuration;
      console.log('[useVideoPlayer] Setting video timer for', maxDuration, 'seconds (media:', media.path, ')');
      const timer = setTimeout(() => {
        console.log('[useVideoPlayer] Video timer expired, calling onVideoEnd');
        onVideoEnd();
      }, maxDuration * 1000);
      
      videoTimerRef.current = timer;
    } else {
      video.pause();
      videoStartTimeRef.current = null;
    }

    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }
    };
  }, [isPlaying, media.type, media.path, slideshowConfig.videoDisplaySeconds, onVideoEnd]);

  // Handle duration changes while video is playing
  useEffect(() => {
    if (media.type !== MediaType.VIDEO || !videoRef.current || !isPlaying || !videoStartTimeRef.current) {
      return;
    }

    const newDuration = slideshowConfig.videoDisplaySeconds || 10;
    
    // Only reset timer if duration actually changed
    if (newDuration !== currentDurationRef.current) {
      console.log('[useVideoPlayer] Duration changed from', currentDurationRef.current, 'to', newDuration, 'seconds');
      
      // Calculate elapsed time
      const elapsed = (Date.now() - videoStartTimeRef.current) / 1000;
      const remaining = Math.max(0, newDuration - elapsed);
      
      console.log('[useVideoPlayer] Elapsed:', elapsed, 'seconds, Remaining:', remaining, 'seconds');
      
      // Clear old timer
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }
      
      // Update current duration
      currentDurationRef.current = newDuration;
      
      // Set new timer with remaining time
      if (remaining > 0) {
        const timer = setTimeout(() => {
          console.log('[useVideoPlayer] Video timer expired after duration change, calling onVideoEnd');
          onVideoEnd();
        }, remaining * 1000);
        
        videoTimerRef.current = timer;
      } else {
        // Duration already expired, trigger immediately
        console.log('[useVideoPlayer] Duration already expired, calling onVideoEnd immediately');
        onVideoEnd();
      }
    }
  }, [slideshowConfig.videoDisplaySeconds, media.type, isPlaying, onVideoEnd]);

  // Video event handlers - use refs to avoid recreating on every render
  const isPlayingRef = useRef(isPlaying);
  const onVideoEndRef = useRef(onVideoEnd);
  
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onVideoEndRef.current = onVideoEnd;
  }, [isPlaying, onVideoEnd]);

  // Video event handlers
  useEffect(() => {
    if (media.type !== MediaType.VIDEO || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    
    const handlePlay = () => {
      setVideoIsActuallyPlaying(true);
    };

    const handlePause = () => {
      setVideoIsActuallyPlaying(false);
    };

    const handleEnded = () => {
      if (videoRef.current && isPlayingRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(error => {
          console.error('[useVideoPlayer] Error replaying video after ended:', error);
        });
      }
    };

    const handleError = (e: Event) => {
      console.error('[useVideoPlayer] Video error event:', e);
      const videoError = video.error;
      if (videoError) {
        let errorMsg = 'Unknown video error';
        switch (videoError.code) {
          case videoError.MEDIA_ERR_ABORTED:
            errorMsg = 'Video playback aborted';
            break;
          case videoError.MEDIA_ERR_NETWORK:
            errorMsg = 'Network error loading video';
            break;
          case videoError.MEDIA_ERR_DECODE:
            errorMsg = 'Video decode error';
            break;
          case videoError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'Video format not supported';
            break;
        }
        console.error(`[useVideoPlayer] Video error details: ${errorMsg} (code: ${videoError.code})`);
      }
    };

    const handleLoadedData = () => {
      console.log('[useVideoPlayer] Video loaded successfully');
    };

    const handleCanPlay = () => {
      console.log('[useVideoPlayer] Video can play');
      // If we're supposed to be playing, try to play now that video is ready
      if (isPlayingRef.current && video.paused) {
        video.play().catch(error => {
          console.error('[useVideoPlayer] Error playing video after canplay:', error);
        });
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [media]);

  return {
    videoRef,
    videoIsActuallyPlaying,
  };
}

