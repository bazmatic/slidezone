import { MediaFile } from '@/types/media';

export interface MediaServiceResult {
  success: boolean;
  files: MediaFile[];
  count: number;
  error?: string;
}

export interface MediaService {
  getMediaFiles(): MediaServiceResult | Promise<MediaServiceResult>;
  readMediaFolder(folderPath: string): Promise<MediaServiceResult>;
}

