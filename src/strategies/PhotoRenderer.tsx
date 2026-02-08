import React from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { MediaRenderer, MediaRendererProps } from './MediaRenderer';
import { PhotoDisplay } from '@/components/PhotoDisplay';

export class PhotoRenderer implements MediaRenderer {
  canRender(media: MediaFile): boolean {
    return media.type === MediaType.PHOTO;
  }

  render(props: MediaRendererProps): React.ReactElement {
    return <PhotoDisplay media={props.media} config={props.config} />;
  }
}

