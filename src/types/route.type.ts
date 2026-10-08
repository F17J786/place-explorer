export type TravelMode = 'driving' | 'motorcycle' | 'walking';

export interface RouteStepInfo {
  distanceMeters: number;
  durationSeconds: number;
  type: number;
  name: string;
}

export interface RouteAlternative {
  coords: { latitude: number; longitude: number }[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStepInfo[];
}

export type RouteModeResults = Record<TravelMode, RouteAlternative[] | null>;
export type RouteModeLoading = Record<TravelMode, boolean>;
export type RouteModeActiveIndex = Record<TravelMode, number>;
