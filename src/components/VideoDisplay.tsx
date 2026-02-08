import React from 'react';
import { MediaFile, SlideshowConfig } from '@/types/media';
import { convertMediaUrl } from '@/utils/mediaUtils';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

interface VideoDisplayProps {
  media: MediaFile;
  config: Partial<SlideshowConfig>;
  isPlaying: boolean;
  isMuted?: boolean;
  onVideoEnd: () => void;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  media,
  config,
  isPlaying,
  isMuted = false,
  onVideoEnd,
}) => {
  const mediaUrl = convertMediaUrl(media.path);
  const { videoRef } = useVideoPlayer({
    media,
    isPlaying,
    config: config as SlideshowConfig,
    onVideoEnd,
  });

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="w-full h-full object-contain"
      autoPlay={false}
      loop
      playsInline
      preload="auto"
      muted={isMuted}
      onError={(e) => {
        console.error('[VideoDisplay] Video element error:', e);
        const video = e.currentTarget;
        if (video.error) {
          console.error('[VideoDisplay] Video error code:', video.error.code);
          console.error('[VideoDisplay] Video error message:', video.error.message);
          console.error('[VideoDisplay] Video src:', video.src);
        }
      }}
      style={{
        transition: `opacity ${config.transitionDuration || 1000}ms ease-in-out`,
      }}
    />
  );
};

