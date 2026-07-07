import AsyncStorage from '@react-native-async-storage/async-storage';
import { Region } from 'react-native-maps';
import { LAST_REGION_KEY } from '@/constants/constants';

export const loadLastRegion = async (): Promise<Region | null> => {
  try {
    const raw = await AsyncStorage.getItem(LAST_REGION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLastRegion = async (region: Region) => {
  try {
    await AsyncStorage.setItem(LAST_REGION_KEY, JSON.stringify(region));
  } catch {}
};
