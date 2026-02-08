export enum KeyboardShortcut {
  PLAY_PAUSE = ' ',
  PREVIOUS = 'ArrowLeft',
  NEXT = 'ArrowRight',
  SHUFFLE = 's',
  FILTER = 'f',
  OPEN_FINDER = 'o',
  MUTE = 'm',
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
  'm': KeyboardShortcut.MUTE,
  'M': KeyboardShortcut.MUTE,
};

/** Display label for tooltips (shortcut only; no action name). */
export const SHORTCUT_LABELS: Partial<Record<KeyboardShortcut, string>> = {
  [KeyboardShortcut.PLAY_PAUSE]: 'Space',
  [KeyboardShortcut.PREVIOUS]: '←',
  [KeyboardShortcut.NEXT]: '→',
  [KeyboardShortcut.SHUFFLE]: 'S',
  [KeyboardShortcut.FILTER]: 'F',
  [KeyboardShortcut.OPEN_FINDER]: 'O',
  [KeyboardShortcut.MUTE]: 'M',
};