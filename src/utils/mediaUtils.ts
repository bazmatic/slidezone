import { MediaFile, MediaType, SlideshowConfig, MediaFilter, DisplayOrder } from '@/types/media';

export function getDisplayTime(media: MediaFile | null, config: SlideshowConfig): number {
  if (!media) {
    return config.photoDisplaySeconds;
  }
  if (media.type === MediaType.VIDEO && config.playVideoToEnd) {
    return 0;
  }
  return media.type === MediaType.PHOTO
    ? config.photoDisplaySeconds
    : config.videoDisplaySeconds;
}

export function convertMediaUrl(filePath: string): string {
  // If it's already a URL (starts with http://, https://, media://, or file://), return as is
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('media://') ||
    filePath.startsWith('file://')
  ) {
    return filePath;
  }

  // In web mode, relative paths starting with /media/ should work as-is
  if (filePath.startsWith('/media/')) {
    return filePath;
  }

  // If it's an absolute path (starts with / on Unix or has drive letter on Windows), convert to media:// URL
  if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
    // Use custom media protocol to avoid CORS issues
    return `media://${encodeURIComponent(filePath)}`;
  }

  // Otherwise, treat as relative path
  return filePath;
}

export function getNextFilter(current: MediaFilter): MediaFilter {
  switch (current) {
    case MediaFilter.ALL:
      return MediaFilter.PHOTOS_ONLY;
    case MediaFilter.PHOTOS_ONLY:
      return MediaFilter.VIDEOS_ONLY;
    case MediaFilter.VIDEOS_ONLY:
      return MediaFilter.ALL;
    default:
      return MediaFilter.ALL;
  }
}

export function getNextDisplayOrder(current: DisplayOrder): DisplayOrder {
  switch (current) {
    case DisplayOrder.NONE:
      return DisplayOrder.RANDOM;
    case DisplayOrder.RANDOM:
      return DisplayOrder.ALPHABETICAL;
    case DisplayOrder.ALPHABETICAL:
      return DisplayOrder.REVERSE_ALPHABETICAL;
    case DisplayOrder.REVERSE_ALPHABETICAL:
      return DisplayOrder.NONE;
    default:
      return DisplayOrder.NONE;
  }
}

export function filterMediaFiles(files: MediaFile[], filter: MediaFilter): MediaFile[] {
  switch (filter) {
    case MediaFilter.PHOTOS_ONLY:
      return files.filter(file => file.type === MediaType.PHOTO);
    case MediaFilter.VIDEOS_ONLY:
      return files.filter(file => file.type === MediaType.VIDEO);
    case MediaFilter.ALL:
    default:
      return files;
  }
}

