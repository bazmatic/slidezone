import { MediaFile } from './media';

export interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  readMediaFolder: (folderPath: string) => Promise<{
    success: boolean;
    files: MediaFile[];
    count: number;
    error?: string;
  }>;
  getSavedFolder: () => Promise<string | undefined>;
  clearSavedFolder: () => Promise<boolean>;
  openInFinder?: (filePath: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

