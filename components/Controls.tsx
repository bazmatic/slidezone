'use client';

import React, { useState } from 'react';
import { MediaType, MediaFilter } from '@/types/media';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onSettings: () => void;
  onOpenInFinder: () => void;
  currentIndex: number;
  totalFiles: number;
  timeRemaining: number;
  mediaType: MediaType;
  isShuffled?: boolean;
  onChangeFolder?: () => void;
  onClearSavedFolder?: () => void;
  isElectron?: boolean;
  mediaFilter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onSettings,
  onOpenInFinder,
  currentIndex,
  totalFiles,
  timeRemaining,
  mediaType,
  isShuffled = false,
  onChangeFolder,
  onClearSavedFolder,
  isElectron = false,
  mediaFilter,
  onFilterChange,
}) => {
  console.log('Controls component - onChangeFolder:', !!onChangeFolder, 'onClearSavedFolder:', !!onClearSavedFolder, 'isElectron:', isElectron);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <>
      {/* Toggle Circle - Always Visible */}
      <button
        onClick={toggleMenu}
        className="absolute top-4 left-4 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 z-50 border-2 border-gray-800"
        title="Toggle Menu"
      >
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Menu Panel - Hidden by Default */}
      {isMenuVisible && (
        <div className="absolute left-4 top-20 bg-black bg-opacity-75 text-white p-4 rounded-lg backdrop-blur-sm transition-all duration-200 z-40">
          <div className="flex flex-col items-center space-y-4 min-w-[200px]">

            {/* Control Buttons */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={onPrevious}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                title="Previous"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={onPlayPause}
                className="p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                title="Next"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="w-8 h-px bg-white bg-opacity-30"></div>

              <button
                onClick={onShuffle}
                className={`p-2 rounded-full transition-all ${
                  isShuffled 
                    ? 'bg-blue-500 bg-opacity-80 hover:bg-opacity-90' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={isShuffled ? 'Shuffle (On)' : 'Shuffle (Off)'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>

              <button
                onClick={() => {
                  const nextFilter = mediaFilter === MediaFilter.ALL 
                    ? MediaFilter.PHOTOS_ONLY 
                    : mediaFilter === MediaFilter.PHOTOS_ONLY 
                    ? MediaFilter.VIDEOS_ONLY 
                    : MediaFilter.ALL;
                  onFilterChange(nextFilter);
                }}
                className={`p-2 rounded-full transition-all ${
                  mediaFilter === MediaFilter.ALL
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : mediaFilter === MediaFilter.PHOTOS_ONLY
                    ? 'bg-green-500 bg-opacity-80 hover:bg-opacity-90'
                    : 'bg-purple-500 bg-opacity-80 hover:bg-opacity-90'
                }`}
                title={
                  mediaFilter === MediaFilter.ALL 
                    ? 'Filter: All Media' 
                    : mediaFilter === MediaFilter.PHOTOS_ONLY 
                    ? 'Filter: Photos Only' 
                    : 'Filter: Videos Only'
                }
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 1v10h8V4H5zm2 2h4v2H7V6zm0 4h4v2H7v-2z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={onSettings}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={onOpenInFinder}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                title="Open in Finder"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Folder Management Buttons - Only show in Electron mode */}
              {isElectron && onChangeFolder && onClearSavedFolder && (
                <>
                  <div className="w-8 h-px bg-white bg-opacity-30"></div>
                  
                  <button
                    onClick={onChangeFolder}
                    className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
                    title="Change Folder"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    onClick={onClearSavedFolder}
                    className="p-2 rounded-full bg-red-600 bg-opacity-60 hover:bg-opacity-80 transition-all"
                    title="Clear Saved Folder"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="text-xs text-gray-400 text-center">
              <div>Space: Play/Pause</div>
              <div>← →: Navigate</div>
              <div>S: Shuffle</div>
              <div>F: Filter Media</div>
              <div>O: Open in Finder</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Controls; 