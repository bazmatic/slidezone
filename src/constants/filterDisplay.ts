import { MediaFilter } from '@/types/media';

export interface FilterDisplayConfig {
  svgPath: string;
  svgPathSecondary?: string;
  title: string;
  buttonClassName: string;
}

/** Display config for the filter button per MediaFilter. Icon represents what is currently shown. */
export const FILTER_DISPLAY_CONFIG: Record<MediaFilter, FilterDisplayConfig> = {
  [MediaFilter.ALL]: {
    svgPath:
      'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4z',
    svgPathSecondary: 'M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
    title: 'Filter: All Media',
    buttonClassName: 'bg-white bg-opacity-20 hover:bg-opacity-30',
  },
  [MediaFilter.PHOTOS_ONLY]: {
    svgPath:
      'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    title: 'Filter: Photos Only',
    buttonClassName: 'bg-green-500 bg-opacity-80 hover:bg-opacity-90',
  },
  [MediaFilter.VIDEOS_ONLY]: {
    svgPath:
      'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    title: 'Filter: Videos Only',
    buttonClassName: 'bg-purple-500 bg-opacity-80 hover:bg-opacity-90',
  },
};
