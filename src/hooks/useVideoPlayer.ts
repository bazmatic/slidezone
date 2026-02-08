import { useRef, useState, useEffect } from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { SlideshowConfig } from '@/types/media';
import { DEFAULT_VIDEO_DISPLAY_SECONDS } from '@/constants/config';

interface VideoPlayerConfig {
  media: MediaFile;
  isPlaying: boolean;
  config: SlideshowConfig;
  onVideoEnd: () => void;
}

function getVideoTimerSeconds(config: SlideshowConfig): number {
  return config.videoDisplaySeconds ?? DEFAULT_VIDEO_DISPLAY_SECONDS;
}

export function useVideoPlayer(config: VideoPlayerConfig) {
  const { media, isPlaying, config: slideshowConfig, onVideoEnd } = config;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIsActuallyPlaying, setVideoIsActuallyPlaying] = useState<boolean>(false);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const currentDurationRef = useRef<number>(getVideoTimerSeconds(slideshowConfig));
  const playVideoToEnd = slideshowConfig.playVideoToEnd;

  const reachedEndOfCycleRef = useRef(false);

  // Reset internal state when media changes. Do not set currentTime or load() here:
  // the element may still be showing the previous video, so that would flash the
  // previous video's first frame before the new src (from parent) takes effect.
  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current) {
      const video = videoRef.current;

      setVideoIsActuallyPlaying(false);
      reachedEndOfCycleRef.current = false;

      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }

      videoStartTimeRef.current = null;
      currentDurationRef.current = getVideoTimerSeconds(slideshowConfig);

      video.pause();
    }
  }, [media, slideshowConfig]);

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
        if (video.readyState >= 2) {
          video.play().catch(error => {
            console.error('[useVideoPlayer] Error playing video:', error);
            console.error('[useVideoPlayer] Video src:', video.src);
            console.error('[useVideoPlayer] Video readyState:', video.readyState);
          });
        } else {
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

      videoStartTimeRef.current = Date.now();
      if (!playVideoToEnd) {
        const maxDuration = getVideoTimerSeconds(slideshowConfig);
        currentDurationRef.current = maxDuration;
        const timer = setTimeout(() => {
          onVideoEnd();
        }, maxDuration * 1000);
        videoTimerRef.current = timer;
      }
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
  }, [isPlaying, media.type, media.path, playVideoToEnd, slideshowConfig, onVideoEnd]);

  // Handle duration changes while video is playing (only when using timer, not play-to-end)
  useEffect(() => {
    if (
      media.type !== MediaType.VIDEO ||
      !videoRef.current ||
      !isPlaying ||
      !videoStartTimeRef.current ||
      playVideoToEnd
    ) {
      return;
    }

    const newDuration = getVideoTimerSeconds(slideshowConfig);

    if (newDuration !== currentDurationRef.current) {
      const elapsed = (Date.now() - videoStartTimeRef.current) / 1000;
      const remaining = Math.max(0, newDuration - elapsed);

      if (videoTimerRef.current) {
        clearTimeout(videoTimerRef.current);
        videoTimerRef.current = null;
      }

      currentDurationRef.current = newDuration;

      if (remaining > 0) {
        videoTimerRef.current = setTimeout(() => {
          onVideoEnd();
        }, remaining * 1000);
      } else {
        onVideoEnd();
      }
    }
  }, [slideshowConfig, media.type, isPlaying, playVideoToEnd, onVideoEnd]);

  // Video event handlers - use refs to avoid recreating on every render
  const isPlayingRef = useRef(isPlaying);
  const onVideoEndRef = useRef(onVideoEnd);
  const playVideoToEndRef = useRef(playVideoToEnd);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onVideoEndRef.current = onVideoEnd;
    playVideoToEndRef.current = playVideoToEnd;
  }, [isPlaying, onVideoEnd, playVideoToEnd]);

  // Video event handlers
  useEffect(() => {
    if (media.type !== MediaType.VIDEO || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const LOOP_END_THRESHOLD_S = 0.5;

    const handlePlay = () => {
      setVideoIsActuallyPlaying(true);
      reachedEndOfCycleRef.current = false;
    };

    const handlePause = () => {
      setVideoIsActuallyPlaying(false);
    };

    const handleEnded = () => {
      if (!videoRef.current || !isPlayingRef.current) return;
      if (playVideoToEndRef.current) {
        onVideoEndRef.current();
      } else {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(error => {
          console.error('[useVideoPlayer] Error replaying video after ended:', error);
        });
      }
    };

    // With loop=true, ended never fires. Detect one full playthrough for playVideoToEnd.
    const handleTimeUpdateForPlayToEnd = () => {
      if (!playVideoToEndRef.current || !isPlayingRef.current || !videoRef.current) return;
      const v = videoRef.current;
      const duration = v.duration;
      if (!Number.isFinite(duration)) return;
      const t = v.currentTime;
      if (t >= duration - LOOP_END_THRESHOLD_S) {
        reachedEndOfCycleRef.current = true;
      } else if (reachedEndOfCycleRef.current && t < LOOP_END_THRESHOLD_S) {
        reachedEndOfCycleRef.current = false;
        onVideoEndRef.current();
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
    video.addEventListener('timeupdate', handleTimeUpdateForPlayToEnd);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdateForPlayToEnd);
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

