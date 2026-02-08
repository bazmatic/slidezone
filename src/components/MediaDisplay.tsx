import React from 'react';
import { MediaFile } from '@/types/media';
import { SlideshowConfig } from '@/types/media';
import { mediaRendererFactory } from '@/strategies/MediaRendererFactory';

interface MediaDisplayProps {
  media: MediaFile;
  onVideoEnd: () => void;
  config: Partial<SlideshowConfig>;
  isPlaying: boolean;
  isMuted?: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, onVideoEnd, config, isPlaying, isMuted = false }) => {
  const renderer = mediaRendererFactory.getRenderer(media);

  if (!renderer) {
    return (
      <div className="relative w-full h-full flex items-center justify-center text-white">
        <p>Unsupported media type</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderer.render({ media, config, isPlaying, isMuted, onVideoEnd })}
    </div>
  );
};

export default MediaDisplay; 