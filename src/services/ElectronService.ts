import { MediaFile } from '@/types/media';

export interface ElectronService {
  selectFolder(): Promise<string | null>;
  readMediaFolder(folderPath: string): Promise<{
    success: boolean;
    files: MediaFile[];
    count: number;
    error?: string;
  }>;
  getSavedFolder(): Promise<string | undefined>;
  clearSavedFolder(): Promise<boolean>;
  openInFinder(filePath: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  isAvailable(): boolean;
}

