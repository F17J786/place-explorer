import { Region } from 'react-native-maps';

export const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1443B0',
  primaryLight: '#EBF5FF',
  white: '#FFFFFF',
  text: '#0F172A',
  textSec: '#475569',
  textMuted: '#94A3B8',
  border: '#CBD5E1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  surface: 'rgba(255,255,255,0.97)',
};

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

export const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

export const getConfig = (amenity: string) =>
  AMENITY_CONFIG[amenity] ?? AMENITY_CONFIG.default;
