import { MediaService, MediaServiceResult } from '../MediaService';
import { MediaFile, MediaType } from '@/types/media';
import { getMediaFiles } from '@/api/media';

export class WebMediaServiceImpl implements MediaService {
  getMediaFiles(): MediaServiceResult {
    return getMediaFiles();
  }

  async readMediaFolder(_folderPath: string): Promise<MediaServiceResult> {
    // Web mode doesn't support folder selection, return empty result
    return {
      success: false,
      files: [],
      count: 0,
      error: 'Folder selection is not available in web mode'
    };
  }
}

