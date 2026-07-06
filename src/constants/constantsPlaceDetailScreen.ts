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
  star: '#F59E0B',
  success: '#10B981',
  cardShadow: 'rgba(26,86,219,0.08)',
} as const;

export const CHECKIN_MAX_DISTANCE_METERS = 3000;
export const EARTH_RADIUS_METERS = 6371000;

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
} as const;

export const REVIEW_PREVIEW_LIMIT = 5;
export const CHECKIN_PREVIEW_LIMIT = 3;

export const SHARE_BASE_URL = 'https://f17j786.github.io/place';
