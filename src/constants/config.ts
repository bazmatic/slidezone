import { SlideshowConfig } from '@/types/media';

export const DEFAULT_CONFIG: SlideshowConfig = {
  photoDisplaySeconds: 10,
  videoDisplaySeconds: 10,
  transitionDuration: 1000,
  enableKenBurns: true,
  kenBurnsDuration: 5000,
};

export const SUPPORTED_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

export const MEDIA_FOLDER_PATH = '/media'; 