import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { STORAGE_KEYS } from '@/constants/storageKeys';
import CryptoService from '@/utils/crypto';

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const useEncryptedStorage = () => {
  const saveData = useCallback(async (key: StorageKey, value: unknown) => {
    const encrypted = CryptoService.encrypt(value);
    await AsyncStorage.setItem(key, encrypted);
  }, []);

  const loadData = useCallback(
    async <T>(key: StorageKey): Promise<T | null> => {
      const raw = await AsyncStorage.getItem(key);

      if (!raw) {
        return null;
      }

      return CryptoService.decrypt(raw) as T;
    },
    [],
  );

  const removeData = useCallback(async (key: StorageKey) => {
    await AsyncStorage.removeItem(key);
  }, []);

  return { saveData, loadData, removeData };
};
