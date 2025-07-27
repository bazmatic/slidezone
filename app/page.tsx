'use client';

import React, { useState, useEffect } from 'react';
import { MediaFile, MediaType } from '@/types/media';
import { SUPPORTED_PHOTO_EXTENSIONS, SUPPORTED_VIDEO_EXTENSIONS, MEDIA_FOLDER_PATH } from '@/constants/config';
import Slideshow from '@/components/Slideshow';

export default function Home() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMediaFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/media');
        const data = await response.json();

        if (data.success) {
          setMediaFiles(data.files);
        } else {
          setError(data.error || 'Failed to load media files');
        }
      } catch (err) {
        setError('Failed to load media files');
        console.error('Error loading media files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaFiles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading media files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <p className="mb-4">No media files found</p>
          <p className="text-sm text-gray-400">
            Place your photos and videos in the {MEDIA_FOLDER_PATH} folder
          </p>
        </div>
      </div>
    );
  }

  return <Slideshow mediaFiles={mediaFiles} />;
} 