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

// Electron API types
declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      readMediaFolder: (folderPath: string) => Promise<{
        success: boolean;
        files: MediaFile[];
        count: number;
        error?: string;
      }>;
      getSavedFolder: () => Promise<string | undefined>;
      clearSavedFolder: () => Promise<boolean>;
      // Chromecast methods
      getChromecastDevices: () => Promise<{
        success: boolean;
        devices: Array<{ id: string; name: string; friendlyName: string }>;
        error?: string;
      }>;
      startChromecastSession: (deviceId: string) => Promise<{
        success: boolean;
        session?: any;
        error?: string;
      }>;
      stopChromecastSession: () => Promise<{
        success: boolean;
        error?: string;
      }>;
      castMedia: (mediaUrl: string, mediaType: string) => Promise<{
        success: boolean;
        mediaUrl: string;
        mediaType: string;
        error?: string;
      }>;
      getChromecastStatus: () => Promise<{
        success: boolean;
        session?: any;
        connected: boolean;
      }>;
    };
  }
} 