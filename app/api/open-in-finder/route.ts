import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path is required' },
        { status: 400 }
      );
    }

    console.log('Opening file in Finder:', filePath);

    // Check if the file path is a web URL (browser mode) or absolute path (Electron mode)
    if (filePath.startsWith('/media/') || filePath.startsWith('http')) {
      // Browser mode: web URLs can't be opened in Finder from server
      console.log('Browser mode: Skipping Finder open for web URL:', filePath);
      return NextResponse.json({
        success: true,
        message: 'Finder open skipped in browser mode'
      });
    }

    // Electron mode: use the macOS 'open' command to open the file in Finder
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