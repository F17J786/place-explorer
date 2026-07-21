import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoService from '@/utils/crypto';
import type { STORAGE_KEYS } from '@/constants/storageKeys';

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const saveEncryptedData = async (key: StorageKey, value: unknown) => {
  const encrypted = CryptoService.encrypt(value);
  await AsyncStorage.setItem(key, encrypted);
};

export const loadEncryptedData = async <T>(
  key: StorageKey,
): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return CryptoService.decrypt(raw) as T;
};

export const removeEncryptedData = async (key: StorageKey) => {
  await AsyncStorage.removeItem(key);
};
