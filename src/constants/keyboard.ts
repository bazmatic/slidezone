export enum KeyboardShortcut {
  PLAY_PAUSE = ' ',
  PREVIOUS = 'ArrowLeft',
  NEXT = 'ArrowRight',
  SHUFFLE = 's',
  FILTER = 'f',
  OPEN_FINDER = 'o',
}

export const KEYBOARD_SHORTCUT_MAP: Record<string, KeyboardShortcut> = {
  ' ': KeyboardShortcut.PLAY_PAUSE,
  'ArrowLeft': KeyboardShortcut.PREVIOUS,
  'ArrowRight': KeyboardShortcut.NEXT,
  's': KeyboardShortcut.SHUFFLE,
  'S': KeyboardShortcut.SHUFFLE,
  'f': KeyboardShortcut.FILTER,
  'F': KeyboardShortcut.FILTER,
  'o': KeyboardShortcut.OPEN_FINDER,
  'O': KeyboardShortcut.OPEN_FINDER,
};

