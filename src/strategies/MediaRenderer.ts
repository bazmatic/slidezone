import React from 'react';
import { MediaFile, SlideshowConfig } from '@/types/media';

export interface MediaRendererProps {
  media: MediaFile;
  config: Partial<SlideshowConfig>;
  isPlaying: boolean;
  isMuted?: boolean;
  onVideoEnd?: () => void;
}

export interface MediaRenderer {
  canRender(media: MediaFile): boolean;
  render(props: MediaRendererProps): React.ReactElement;
}

