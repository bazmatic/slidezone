'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { SlideshowConfig } from '@/types/media';
import KenBurnsEffect, { KenBurnsType } from './KenBurnsEffect';

interface MediaDisplayProps {
  media: MediaFile;
  onVideoEnd: () => void;
  config: Partial<SlideshowConfig>;
  isPlaying: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, onVideoEnd, config, isPlaying }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalTimePlayed, setTotalTimePlayed] = useState<number>(0);
  const [lastVideoTime, setLastVideoTime] = useState<number>(0);
  const [videoIsActuallyPlaying, setVideoIsActuallyPlaying] = useState<boolean>(false);

  // Convert file path to proper URL for display
  const getMediaUrl = (filePath: string): string => {
    // If it's already a URL (starts with http://, https://, media://, or file://), return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('media://') || filePath.startsWith('file://')) {
      return filePath;
    }

    // In web mode, relative paths starting with /media/ should work as-is
    if (filePath.startsWith('/media/')) {
      // This is a web-accessible path, return as-is
      return filePath;
    }

    // If it's an absolute path (starts with / on Unix or has drive letter on Windows), convert to media:// URL
    if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
      // Use custom media protocol to avoid CORS issues
      return `media://${encodeURIComponent(filePath)}`;
    }

    // Otherwise, treat as relative path
    return filePath;
  };

  const mediaUrl = getMediaUrl(media.path);

  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration);
        setTotalTimePlayed(0);
        setLastVideoTime(0);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handlePlay = () => {
        setVideoIsActuallyPlaying(true);
      };

      const handlePause = () => {
        setVideoIsActuallyPlaying(false);
      };

      const handleEnded = () => {
        // Video ended, but we want it to loop until total time is reached
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [media, onVideoEnd]);

  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current && videoDuration > 0 && isPlaying) {
      const video = videoRef.current;
      const maxDuration = config.videoDisplaySeconds || 10;
      
      // Calculate total time played including loops
      let newTotalTime = totalTimePlayed;
      
      if (currentTime < lastVideoTime) {
        // Video looped, add the duration of the previous loop
        newTotalTime += lastVideoTime;
      } else {
        // Normal progression, add the difference
        newTotalTime += currentTime - lastVideoTime;
      }
      
      setTotalTimePlayed(newTotalTime);
      setLastVideoTime(currentTime);
      
      // Check if we've reached the maximum display time
      if (newTotalTime >= maxDuration) {
        onVideoEnd();
      }
    }
  }, [currentTime, media.type, config.videoDisplaySeconds, onVideoEnd, videoDuration, totalTimePlayed, lastVideoTime, isPlaying]);

  // Handle play/pause for videos
  useEffect(() => {
    if (media.type === MediaType.VIDEO && videoRef.current) {
      const video = videoRef.current;
      
      if (isPlaying) {
        video.play().catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        video.pause();
      }
    }
  }, [isPlaying, media.type]);

  const renderMedia = () => {
    if (media.type === MediaType.PHOTO) {
      const enableKenBurns = config.enableKenBurns !== false; // Default to true
      const kenBurnsDuration = config.kenBurnsDuration || 5000;
      
      if (enableKenBurns) {
        return (
          <KenBurnsEffect
            src={mediaUrl}
            alt={media.name}
            duration={kenBurnsDuration}
            effectType={KenBurnsType.ZOOM_IN}
            className="w-full h-full"
          />
        );
      } else {
        return (
          <img
            src={mediaUrl}
            alt={media.name}
            className="w-full h-full object-contain"
            style={{
              transition: `opacity ${config.transitionDuration || 1000}ms ease-in-out`,
            }}
          />
        );
      }
    } else {
      return (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full h-full object-contain"
          muted
          autoPlay
          loop
          playsInline
          style={{
            transition: `opacity ${config.transitionDuration || 1000}ms ease-in-out`,
          }}
        />
      );
    }
  };

  // Use the actual video playing state for the display
  const displayIsPlaying = media.type === MediaType.VIDEO ? videoIsActuallyPlaying : isPlaying;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderMedia()}
    </div>
  );
};

export default MediaDisplay; 