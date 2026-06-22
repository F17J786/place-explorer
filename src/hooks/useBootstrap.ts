import { useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { KEYCHAIN_SERVICE } from '@/constants/keychain';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useEncryptedStorage } from '@/hooks/useEncryptedStorage';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { User } from '@/types/user';

export const useBootstrap = () => {
  const { loadData } = useEncryptedStorage();
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICE,
        });

        if (credentials) {
          const user = await loadData<User>(STORAGE_KEYS.USER_PROFILE);
          if (user) {
            dispatch(setUser(user));
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.warn('Bootstrap error:', e);
      } finally {
        setIsReady(true);
      }
    };

    checkSession();
  }, []);

  return { isReady, isAuthenticated };
};
