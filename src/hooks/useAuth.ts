import { useCallback, useState } from 'react';
import * as Keychain from 'react-native-keychain';

import { KEYCHAIN_SERVICE } from '@/constants/keychain';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useEncryptedStorage } from '@/hooks/useEncryptedStorage';
import type { LoginFormValues, RegisterFormValues } from '@/types/auth.types';
import type { User } from '@/types/user';
import { useAppDispatch } from '@/store/hooks';
import { useLoginMutation, useRegisterMutation } from '@/store/api/authApi';
import { setUser } from '@/store/slices/authSlice';

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error && typeof error.data === 'string') {
      return error.data;
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return 'Đã xảy ra lỗi, vui lòng thử lại';
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { saveData } = useEncryptedStorage();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [authError, setAuthError] = useState<string | null>(null);

  const persistSession = useCallback(
    async (user: User) => {
      await Keychain.setGenericPassword(user.id, user.id, {
        service: KEYCHAIN_SERVICE,
      });
      await saveData(STORAGE_KEYS.USER_PROFILE, user);
      dispatch(setUser(user));
    },
    [dispatch, saveData],
  );

  const handleLogin = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      const user = await login(values).unwrap();
      await persistSession(user);
      dispatch(setUser(user));
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setAuthError(null);
    try {
      const user = await register({
        name: values.fullName,
        email: values.email,
        password: values.password,
        avatar: values.avatar,
      }).unwrap();

      await persistSession(user);
      dispatch(setUser(user));
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    authError,
    clearAuthError,
    handleLogin,
    handleRegister,
    isLoginLoading,
    isRegisterLoading,
  };
};
