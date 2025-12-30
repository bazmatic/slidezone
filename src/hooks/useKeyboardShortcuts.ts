import { useEffect } from 'react';
import { KeyboardShortcut, KEYBOARD_SHORTCUT_MAP } from '@/constants/keyboard';

interface KeyboardShortcutsConfig {
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onShuffle?: () => void;
  onFilter?: () => void;
  onOpenFinder?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const shortcut = KEYBOARD_SHORTCUT_MAP[event.key];
      
      if (!shortcut) {
        return;
      }

      switch (shortcut) {
        case KeyboardShortcut.PLAY_PAUSE:
          event.preventDefault();
          config.onPlayPause?.();
          break;
        case KeyboardShortcut.PREVIOUS:
          event.preventDefault();
          config.onPrevious?.();
          break;
        case KeyboardShortcut.NEXT:
          event.preventDefault();
          config.onNext?.();
          break;
        case KeyboardShortcut.SHUFFLE:
          event.preventDefault();
          config.onShuffle?.();
          break;
        case KeyboardShortcut.FILTER:
          event.preventDefault();
          config.onFilter?.();
          break;
        case KeyboardShortcut.OPEN_FINDER:
          event.preventDefault();
          config.onOpenFinder?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    config.onPlayPause,
    config.onPrevious,
    config.onNext,
    config.onShuffle,
    config.onFilter,
    config.onOpenFinder,
  ]);
}

