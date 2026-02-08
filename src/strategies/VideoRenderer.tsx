import React from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { MediaRenderer, MediaRendererProps } from './MediaRenderer';
import { VideoDisplay } from '@/components/VideoDisplay';

export class VideoRenderer implements MediaRenderer {
  canRender(media: MediaFile): boolean {
    return media.type === MediaType.VIDEO;
  }

  render(props: MediaRendererProps): React.ReactElement {
    if (!props.onVideoEnd) {
      throw new Error('onVideoEnd is required for VideoRenderer');
    }
    return (
      <VideoDisplay
        media={props.media}
        config={props.config}
        isPlaying={props.isPlaying}
        isMuted={props.isMuted}
        onVideoEnd={props.onVideoEnd}
      />
    );
  }
}

