export type FilterType = 'newest' | 1 | 2 | 3 | 4 | 5;

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
  duration?: number;
}
