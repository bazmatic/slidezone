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