import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { processMediaFiles } from '@/utils/mediaLoader';

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
    
    // Process the files to get media information
    const processedFiles = processMediaFiles(mediaFiles);
    
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