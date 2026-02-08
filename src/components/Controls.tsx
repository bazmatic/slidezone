import React, { useState } from 'react';
import { MediaType, MediaFilter } from '@/types/media';
import { getNextFilter } from '@/utils/mediaUtils';
import { KeyboardShortcut, SHORTCUT_LABELS } from '@/constants/keyboard';

function tooltipWithShortcut(label: string, shortcut: KeyboardShortcut | undefined): string {
  const shortcutLabel = shortcut !== undefined ? SHORTCUT_LABELS[shortcut] : undefined;
  return shortcutLabel ? `${label} (${shortcutLabel})` : label;
}

interface ControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
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
  isMuted,
  onMuteToggle,
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
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <>
      {/* Toggle Circle - Always Visible */}
      <button
        onClick={toggleMenu}
        className="absolute top-4 left-4 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-200 z-50 border-2 border-gray-800 focus:outline-none focus:ring-1 focus:ring-white/30 focus:ring-offset-1 focus:ring-offset-gray-800"
        title="Toggle Menu"
      >
        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
        </svg>
      </button>

      {/* Menu Panel - Directly below hamburger, left-aligned */}
      {isMenuVisible && (
        <div className="absolute left-4 top-16 bg-black bg-opacity-75 text-white py-4 pl-2 pr-4 rounded-lg backdrop-blur-sm transition-all duration-200 z-40">
          <div className="flex flex-col items-start space-y-4">

            {/* Control Buttons */}
            <div className="flex flex-col items-start space-y-2">
              <button
                onClick={onPrevious}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                title={tooltipWithShortcut('Previous', KeyboardShortcut.PREVIOUS)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>

              <button
                onClick={onPlayPause}
                className="p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                title={tooltipWithShortcut(isPlaying ? 'Pause' : 'Play', KeyboardShortcut.PLAY_PAUSE)}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                title={tooltipWithShortcut('Next', KeyboardShortcut.NEXT)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
              </button>

              <button
                onClick={onMuteToggle}
                className={`p-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white/25 ${
                  isMuted ? 'bg-amber-500/60 hover:bg-amber-500/80' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={tooltipWithShortcut(isMuted ? 'Unmute' : 'Mute', KeyboardShortcut.MUTE)}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              <div className="w-8 h-px bg-white bg-opacity-30"></div>

              <button
                onClick={onShuffle}
                className={`p-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white/25 ${
                  isShuffled 
                    ? 'bg-blue-500 bg-opacity-80 hover:bg-opacity-90' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={tooltipWithShortcut(isShuffled ? 'Shuffle (On)' : 'Shuffle (Off)', KeyboardShortcut.SHUFFLE)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                </svg>
              </button>

              <button
                onClick={() => {
                  onFilterChange(getNextFilter(mediaFilter));
                }}
                className={`p-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white/25 ${
                  mediaFilter === MediaFilter.ALL
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : mediaFilter === MediaFilter.PHOTOS_ONLY
                    ? 'bg-green-500 bg-opacity-80 hover:bg-opacity-90'
                    : 'bg-purple-500 bg-opacity-80 hover:bg-opacity-90'
                }`}
                title={tooltipWithShortcut(
                  mediaFilter === MediaFilter.ALL 
                    ? 'Filter: All Media' 
                    : mediaFilter === MediaFilter.PHOTOS_ONLY 
                    ? 'Filter: Photos Only' 
                    : 'Filter: Videos Only',
                  KeyboardShortcut.FILTER
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.88V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
                </svg>
              </button>

              <button
                onClick={onSettings}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                title={tooltipWithShortcut('Settings', undefined)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </button>

              <button
                onClick={onOpenInFinder}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                title={tooltipWithShortcut('Open in Finder', KeyboardShortcut.OPEN_FINDER)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                </svg>
              </button>

              {/* Folder Management Buttons - Only show in Electron mode */}
              {isElectron && onChangeFolder && onClearSavedFolder && (
                <>
                  <div className="w-8 h-px bg-white bg-opacity-30"></div>
                  
                  <button
                    onClick={onChangeFolder}
                    className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                    title={tooltipWithShortcut('Change Folder', undefined)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                      <path d="M12 8l4 4-4 4-1.41-1.41L12.17 13H8v-2h4.17l-1.58-1.59L12 8z" fill="currentColor"/>
                    </svg>
                  </button>

                  <button
                    onClick={onClearSavedFolder}
                    className="p-2 rounded-full bg-red-600 bg-opacity-60 hover:bg-opacity-80 transition-all focus:outline-none focus:ring-1 focus:ring-white/25"
                    title={tooltipWithShortcut('Clear Saved Folder', undefined)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Controls; 