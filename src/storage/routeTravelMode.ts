import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelMode } from '@/types/route.type';

const KEY = '@place_explorer/route_travel_mode';

export const loadTravelMode = async (): Promise<TravelMode | null> => {
  try {
    const value = await AsyncStorage.getItem(KEY);
    if (value === 'driving' || value === 'motorcycle' || value === 'walking') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveTravelMode = async (mode: TravelMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, mode);
  } catch {}
};
