export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video'
}

export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: MediaType;
  extension: string;
}

export interface SlideshowConfig {
  photoDisplaySeconds: number;
  videoDisplaySeconds: number;
  transitionDuration: number;
}

export interface SlideshowState {
  currentIndex: number;
  isPlaying: boolean;
  currentMedia: MediaFile | null;
  timeRemaining: number;
} 