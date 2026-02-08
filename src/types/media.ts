export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video'
}

export enum MediaFilter {
  ALL = 'all',
  PHOTOS_ONLY = 'photos_only',
  VIDEOS_ONLY = 'videos_only'
}

export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: MediaType;
  extension: string;
  mtime?: Date;
}

export interface SlideshowConfig {
  photoDisplaySeconds: number;
  videoDisplaySeconds: number;
  playVideoToEnd: boolean;
  transitionDuration: number;
  enableKenBurns: boolean;
  kenBurnsDuration: number;
}

export interface SlideshowState {
  currentIndex: number;
  isPlaying: boolean;
  currentMedia: MediaFile | null;
  timeRemaining: number;
} 