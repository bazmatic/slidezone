import { MediaFile, MediaType } from '@/types/media';
import { SUPPORTED_PHOTO_EXTENSIONS, SUPPORTED_VIDEO_EXTENSIONS } from '@/constants/config';

export const getMediaTypeFromExtension = (extension: string): MediaType | null => {
  const ext = extension.toLowerCase();
  
  if (SUPPORTED_PHOTO_EXTENSIONS.includes(ext)) {
    return MediaType.PHOTO;
  }
  
  if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
    return MediaType.VIDEO;
  }
  
  return null;
};

export const processMediaFiles = (files: string[]): MediaFile[] => {
  return files
    .map((file, index) => {
      const extension = file.substring(file.lastIndexOf('.'));
      const mediaType = getMediaTypeFromExtension(extension);
      
      if (!mediaType) {
        return null;
      }
      
      return {
        id: `file-${index}`,
        name: file.substring(0, file.lastIndexOf('.')),
        path: `/media/${file}`,
        type: mediaType,
        extension,
      };
    })
    .filter((file): file is MediaFile => file !== null);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 