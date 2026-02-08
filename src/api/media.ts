import { MediaFile } from '@/types/media';
import { getMediaTypeFromExtension } from '@/utils/mediaLoader';

// Use Vite's import.meta.glob to discover all media files at build time
const mediaModules = import.meta.glob('/public/media/**/*.{jpg,jpeg,png,gif,bmp,webp,mp4,webm,ogg,mov,avi}', {
  eager: true,
  as: 'url'
});

// Simple API function to get media files from public folder
export function getMediaFiles(): { success: boolean; files: MediaFile[]; count: number; error?: string } {
  try {
    console.log('[getMediaFiles] Discovering media files from /public/media/');
    
    const mediaFiles: MediaFile[] = [];
    const fileEntries = Object.entries(mediaModules);
    
    console.log(`[getMediaFiles] Found ${fileEntries.length} potential media files`);
    
    fileEntries.forEach(([filePath]) => {
      const pathParts = filePath.split('/');
      const filename = pathParts[pathParts.length - 1];
      const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
      const mediaType = getMediaTypeFromExtension(extension);
      
      if (mediaType) {
        const name = filename.substring(0, filename.lastIndexOf('.'));
        const webPath = filePath.replace('/public', '');
        
        mediaFiles.push({
          id: webPath,
          name,
          path: webPath,
          type: mediaType,
          extension,
          mtime: new Date(),
        });
      }
    });
    
    mediaFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`[getMediaFiles] Successfully discovered ${mediaFiles.length} media files`);
    
    return {
      success: true,
      files: mediaFiles,
      count: mediaFiles.length
    };
  } catch (error) {
    console.error('[getMediaFiles] Error discovering media files:', error);
    return {
      success: false,
      files: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
