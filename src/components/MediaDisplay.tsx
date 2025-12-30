import React from 'react';
import { MediaFile } from '@/types/media';
import { SlideshowConfig } from '@/types/media';
import { mediaRendererFactory } from '@/strategies/MediaRendererFactory';

interface MediaDisplayProps {
  media: MediaFile;
  onVideoEnd: () => void;
  config: Partial<SlideshowConfig>;
  isPlaying: boolean;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, onVideoEnd, config, isPlaying }) => {
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
      {renderer.render({ media, config, isPlaying, onVideoEnd })}
    </div>
  );
};

export default MediaDisplay; 