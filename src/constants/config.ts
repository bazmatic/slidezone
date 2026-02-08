import { SlideshowConfig } from '@/types/media';

export const DEFAULT_VIDEO_DISPLAY_SECONDS = 10;

export const DEFAULT_CONFIG: SlideshowConfig = {
  photoDisplaySeconds: 10,
  videoDisplaySeconds: DEFAULT_VIDEO_DISPLAY_SECONDS,
  playVideoToEnd: false,
  transitionDuration: 1000,
  enableKenBurns: true,
  kenBurnsDuration: 5000,
};

export const SUPPORTED_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

export const MEDIA_FOLDER_PATH = '/media';

/** localStorage key for slideshow settings (web only). */
export const SLIDESHOW_SETTINGS_STORAGE_KEY = 'slidezone-slideshow-settings'; 