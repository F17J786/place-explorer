import { MapType, Region } from 'react-native-maps';

export interface OsmMarker {
  id: string;
  name: string;
  amenity: string;
  score: number;
  coordinate: { latitude: number; longitude: number };
  photoUrl?: string;
  address?: string;
  tags?: Record<string, string>;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  displayName: string;
  coordinate: { latitude: number; longitude: number };
  type: 'place' | 'marker';
  amenity?: string;
}

export interface RoutePoint {
  coordinate: { latitude: number; longitude: number };
  label: string;
  name: string;
  isMyLocation?: boolean;
}

export type { MapType, Region };
