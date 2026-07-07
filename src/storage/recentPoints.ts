import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_RECENT, RECENT_STORAGE_KEY } from '@/constants/constants';
import { SearchSuggestion } from '@/types/mapScreen.type';

export const loadRecentFromStorage = async (): Promise<SearchSuggestion[]> => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRecentToStorage = async (list: SearchSuggestion[]) => {
  try {
    await AsyncStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

export const addToRecent = (
  list: SearchSuggestion[],
  item: SearchSuggestion,
): SearchSuggestion[] => {
  const next = [item, ...list.filter(r => r.id !== item.id)].slice(
    0,
    MAX_RECENT,
  );
  saveRecentToStorage(next);
  return next;
};
