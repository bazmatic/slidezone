import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Construct the full path to the media file
    const mediaDir = join(process.cwd(), 'public', 'media');
    const filePath = join(mediaDir, filename);

    // Use the macOS 'open' command to open the file in Finder
    exec(`open -R "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error opening file in Finder:', error);
        return;
      }
      console.log('File opened in Finder successfully');
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in open-in-finder API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to open file in Finder' },
      { status: 500 }
    );
  }
} 