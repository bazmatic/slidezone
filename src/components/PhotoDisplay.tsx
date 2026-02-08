import React from 'react';
import { MediaFile, SlideshowConfig } from '@/types/media';
import { convertMediaUrl } from '@/utils/mediaUtils';
import KenBurnsEffect, { KenBurnsType } from './KenBurnsEffect';

interface PhotoDisplayProps {
  media: MediaFile;
  config: Partial<SlideshowConfig>;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ media, config }) => {
  const mediaUrl = convertMediaUrl(media.path);
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
  }

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
};

