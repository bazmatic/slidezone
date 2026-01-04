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

  // Reset video when media changes
  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current) {
      const video = videoRef.current;
      
      setVideoIsActuallyPlaying(false);
      
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }
      
      video.pause();
      video.currentTime = 0;
      video.load();
    }
  }, [media]);

  // Handle play/pause and duration changes
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
      
      const maxDuration = slideshowConfig.videoDisplaySeconds || 10;
      const timer = setTimeout(() => {
        onVideoEnd();
      }, maxDuration * 1000);
      
      videoTimerRef.current = timer;
    } else {
      video.pause();
    }

    return () => {
      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }
    };
  }, [isPlaying, media.type, slideshowConfig.videoDisplaySeconds, onVideoEnd]);

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

