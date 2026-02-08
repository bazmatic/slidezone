import { DisplayOrder } from '@/types/media';

export interface DisplayOrderConfig {
  svgPath: string;
  svgPathSecondary?: string;
  title: string;
  buttonClassName: string;
}

/** Shuffle icon (used for NONE and RANDOM). */
const SHUFFLE_PATH =
  'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z';

/** Sort ascending (arrow down) for Alphabetical. */
const SORT_ASC_PATH =
  'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z';

/** Sort descending (arrow up) for Reverse alphabetical. */
const SORT_DESC_PATH =
  'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z';

export const DISPLAY_ORDER_CONFIG: Record<DisplayOrder, DisplayOrderConfig> = {
  [DisplayOrder.NONE]: {
    svgPath: SHUFFLE_PATH,
    title: 'Order: No order',
    buttonClassName: 'bg-white bg-opacity-20 hover:bg-opacity-30',
  },
  [DisplayOrder.RANDOM]: {
    svgPath: SHUFFLE_PATH,
    title: 'Order: Random',
    buttonClassName: 'bg-blue-500 bg-opacity-80 hover:bg-opacity-90',
  },
  [DisplayOrder.ALPHABETICAL]: {
    svgPath: SORT_ASC_PATH,
    title: 'Order: Alphabetical',
    buttonClassName: 'bg-blue-500 bg-opacity-80 hover:bg-opacity-90',
  },
  [DisplayOrder.REVERSE_ALPHABETICAL]: {
    svgPath: SORT_DESC_PATH,
    title: 'Order: Reverse alphabetical',
    buttonClassName: 'bg-blue-500 bg-opacity-80 hover:bg-opacity-90',
  },
};
