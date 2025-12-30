import { MediaFile } from '@/types/media';
import { MediaRenderer } from './MediaRenderer';
import { PhotoRenderer } from './PhotoRenderer';
import { VideoRenderer } from './VideoRenderer';

class MediaRendererFactory {
  private renderers: MediaRenderer[] = [
    new PhotoRenderer(),
    new VideoRenderer(),
  ];

  getRenderer(media: MediaFile): MediaRenderer | null {
    return this.renderers.find(renderer => renderer.canRender(media)) || null;
  }

  registerRenderer(renderer: MediaRenderer): void {
    this.renderers.push(renderer);
  }
}

export const mediaRendererFactory = new MediaRendererFactory();

