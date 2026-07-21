import { useCallback } from 'react';
import {
  saveEncryptedData,
  loadEncryptedData,
  removeEncryptedData,
} from '@/services/encryptedStorage';
import type { STORAGE_KEYS } from '@/constants/storageKeys';

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const useEncryptedStorage = () => {
  const saveData = useCallback(
    (key: StorageKey, value: unknown) => saveEncryptedData(key, value),
    [],
  );

  const loadData = useCallback(
    <T>(key: StorageKey) => loadEncryptedData<T>(key),
    [],
  );

  const removeData = useCallback(
    (key: StorageKey) => removeEncryptedData(key),
    [],
  );

  return { saveData, loadData, removeData };
};
