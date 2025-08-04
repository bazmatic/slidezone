import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getMediaTypeFromExtension } from '@/utils/mediaLoader';

export async function GET() {
  try {
    const mediaDir = join(process.cwd(), 'public', 'media');
    
    // Read all files in the media directory
    const files = await readdir(mediaDir);
    
    // Filter out non-media files (like README.md)
    const mediaFiles = files.filter(file => {
      const extension = file.substring(file.lastIndexOf('.')).toLowerCase();
      return extension && !file.startsWith('.') && file !== 'README.md';
    });
    
    // Get file stats for modification dates
    const filesWithStats = await Promise.all(
      mediaFiles.map(async (file) => {
        const filePath = join(mediaDir, file);
        const stats = await stat(filePath);
        return {
          name: file,
          mtime: stats.mtime
        };
      })
    );
    
    // Sort by modification date (newest first)
    filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    // Process the files to get media information with modification dates
    const processedFiles = filesWithStats.map((file, index) => {
      const extension = file.name.substring(file.name.lastIndexOf('.'));
      const mediaType = getMediaTypeFromExtension(extension);
      
      if (!mediaType) {
        return null;
      }
      
      return {
        id: `file-${index}`,
        name: file.name.substring(0, file.name.lastIndexOf('.')),
        path: `/media/${file.name}`,
        type: mediaType,
        extension,
        mtime: file.mtime,
      };
    }).filter((file): file is any => file !== null);
    
    return NextResponse.json({
      success: true,
      files: processedFiles,
      count: processedFiles.length
    });
  } catch (error) {
    console.error('Error reading media directory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read media directory',
        files: [],
        count: 0
      },
      { status: 500 }
    );
  }
} 