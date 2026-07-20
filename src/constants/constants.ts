import type { Region } from 'react-native-maps';
import type { FilterType } from '@/types/reviewListScreen.types';

export const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1447B8',
  primaryLight: '#EBF0FF',
  white: '#FFFFFF',
  background: '#F8FAFC',
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textSub: '#64748B',
  textSec: '#475569',
  textMuted: '#94A3B8',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  error: '#EF4444',
  danger: '#EF4444',
  tabInactive: '#94A3B8',
  inputBg: '#F7F9FC',
  inputBg2: '#FDFDFE',
  labelText: '#8A96A8',
  placeholder: '#B0BAC9',
  linkText: '#1A6BF5',
  star: '#F59E0B',
  warning: '#F59E0B',
  success: '#10B981',
  gray: '#D1D5DB',
  overlay: 'rgba(15,23,42,0.55)',
  cardShadow: 'rgba(26,86,219,0.08)',
  primaryAlt: '#1A6BF5',
  primaryDarkAlt: '#1443B0',
  primaryLightAlt: '#EBF5FF',
  bodyText: '#1C2B4A',
  error2: '#E53E3E',
  borderDefault: '#E2E8F4',
} as const;

export const CATEGORY_ICON: Record<string, string> = {
  restaurant: 'silverware-fork-knife',
  cafe: 'coffee',
  hotel: 'bed',
  park: 'tree',
  museum: 'bank',
  shop: 'shopping',
  default: 'map-marker',
};

export const CATEGORY_COLOR: Record<string, string> = {
  restaurant: '#F59E0B',
  cafe: '#92400E',
  hotel: '#6366F1',
  park: '#10B981',
  museum: '#8B5CF6',
  shop: '#EC4899',
  default: '#1A56DB',
};

export const AMENITY_CONFIG: Record<string, { icon: string; color: string }> = {
  cafe: { icon: 'local-cafe', color: '#F59E0B' },
  restaurant: { icon: 'restaurant', color: '#EF4444' },
  hospital: { icon: 'local-hospital', color: '#10B981' },
  bank: { icon: 'account-balance', color: '#1A56DB' },
  atm: { icon: 'local-atm', color: '#8B5CF6' },
  pharmacy: { icon: 'local-pharmacy', color: '#06B6D4' },
  school: { icon: 'school', color: '#F97316' },
  fuel: { icon: 'local-gas-station', color: '#6B7280' },
  supermarket: { icon: 'shopping-cart', color: '#EC4899' },
  default: { icon: 'place', color: '#1A56DB' },
};

export const getConfig = (amenity: string) =>
  AMENITY_CONFIG[amenity] ?? AMENITY_CONFIG.default;

export const INITIAL_REGION: Region = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const FILTERS = [
  { key: 'cafe', label: 'Cafe', icon: 'local-cafe' },
  { key: 'restaurant', label: 'Ăn uống', icon: 'restaurant' },
  { key: 'hospital', label: 'Y tế', icon: 'local-hospital' },
  { key: 'bank', label: 'Ngân hàng', icon: 'account-balance' },
  { key: 'atm', label: 'ATM', icon: 'local-atm' },
  { key: 'pharmacy', label: 'Thuốc', icon: 'local-pharmacy' },
  { key: 'school', label: 'Trường học', icon: 'school' },
  { key: 'fuel', label: 'Xăng', icon: 'local-gas-station' },
];

export const MIN_ZOOM = 5;
export const MAX_ZOOM = 20;
export const RECENT_STORAGE_KEY = 'map_recent_route_points';
export const LAST_REGION_KEY = 'map_last_region';
export const MAX_RECENT = 8;

export const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

export const CHECKIN_MAX_DISTANCE_METERS = 3000;
export const CHECKIN_COOLDOWN_MS = 60 * 60 * 1000;
export const EARTH_RADIUS_METERS = 6371000;

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
} as const;

export const REVIEW_PREVIEW_LIMIT = 5;
export const CHECKIN_PREVIEW_LIMIT = 3;

export const SHARE_BASE_URL = 'https://f17j786.github.io/place';

export const GRID_GAP = 5;
export const PREVIEW_LIMIT = 9;

export const CLOUDINARY_UPLOAD_PRESET = 'test_word';
export const CLOUDINARY_CLOUD_NAME = 'dzjbxwjvs';

export const MAX_MEDIA = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MIN_IMAGE_SIZE = 10 * 1024;
export const MAX_VIDEO_SIZE = 75 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 30;

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
