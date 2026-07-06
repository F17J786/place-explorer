import type { FilterType } from '@/types/reviewListScreen.types';

export const CLOUDINARY_UPLOAD_PRESET = 'test_word';
export const CLOUDINARY_CLOUD_NAME = 'dzjbxwjvs';

export const MAX_MEDIA = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MIN_IMAGE_SIZE = 10 * 1024;
export const MAX_VIDEO_SIZE = 75 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 30;

export const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1447B8',
  primaryLight: '#EBF0FF',
  white: '#FFFFFF',
  bg: '#F5F6FA',
  text: '#0F172A',
  textSub: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  gray: '#D1D5DB',
  star: '#F59E0B',
  overlay: 'rgba(15,23,42,0.55)',
  cardShadow: 'rgba(26,86,219,0.08)',
  danger: '#EF4444',
} as const;

export const RATING_HINT_LABELS = [
  '',
  'Rất tệ',
  'Tệ',
  'Bình thường',
  'Tốt',
  'Tuyệt vời',
] as const;

export const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 5, label: '⭐⭐⭐⭐⭐  5 sao' },
  { id: 4, label: '⭐⭐⭐⭐  4 sao' },
  { id: 3, label: '⭐⭐⭐  3 sao' },
  { id: 2, label: '⭐⭐  2 sao' },
  { id: 1, label: '⭐  1 sao' },
];
