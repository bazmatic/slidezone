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

      const handleEnded = () => {
        // Video ended, but we want it to loop until total time is reached
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
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
            src={media.path}
            alt={media.name}
            duration={kenBurnsDuration}
            effectType={KenBurnsType.ZOOM_IN}
            className="w-full h-full"
          />
        );
      } else {
        return (
          <img
            src={media.path}
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
          src={media.path}
          className="w-full h-full object-contain"
          muted
          loop={false}
          style={{
            transition: `opacity ${config.transitionDuration || 1000}ms ease-in-out`,
          }}
        />
      );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderMedia()}
      
      {media.type === MediaType.VIDEO && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
          <div className="flex justify-between text-sm">
            <span>{media.name}</span>
            <div className="flex items-center space-x-2">
              {!isPlaying && (
                <span className="text-yellow-300 text-xs">PAUSED</span>
              )}
              <span>
                {Math.floor(totalTimePlayed)}s / {Math.floor(config.videoDisplaySeconds || 10)}s
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-white' : 'bg-yellow-300'
              }`}
              style={{ 
                width: `${(totalTimePlayed / (config.videoDisplaySeconds || 10)) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay; 