import { useState } from 'react';
import * as Keychain from 'react-native-keychain';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth, setUser } from '@/store/slices/authSlice';
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from '@/store/api/profileApi';
import type {
  ChangePasswordFormValues,
  UpdateProfileFormValues,
} from '@/types/profile.types';
import { KEYCHAIN_SERVICE } from '@/constants/keychain';
import { useEncryptedStorage } from './useEncryptedStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [updateProfileMutation, { isLoading: isUpdateProfileLoading }] =
    useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: isChangePasswordLoading }] =
    useChangePasswordMutation();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearProfileError = () => setProfileError(null);
  const clearPasswordError = () => setPasswordError(null);
  const { saveData, removeData } = useEncryptedStorage();

  const handleUpdateProfile = async (
    values: UpdateProfileFormValues,
  ): Promise<{ success: boolean; queued: boolean }> => {
    if (!user) return { success: false, queued: false };
    try {
      const updatedUser = await updateProfileMutation({
        id: user.id,
        ...values,
      }).unwrap();
      dispatch(setUser(updatedUser));

      const queued = Boolean((updatedUser as any)?._pendingSync);

      if (!queued) {
        await saveData(STORAGE_KEYS.USER_PROFILE, updatedUser);
      }

      return { success: true, queued };
    } catch (e: any) {
      setProfileError(
        e?.data?.message ?? e?.data ?? 'Cập nhật thông tin thất bại',
      );
      return { success: false, queued: false };
    }
  };

  const handleChangePassword = async (
    values: ChangePasswordFormValues,
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      await changePasswordMutation({
        id: user.id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      dispatch(setUser({ ...user, password: values.newPassword }));
      return true;
    } catch (e: any) {
      setPasswordError(e?.data?.message ?? e?.data ?? 'Đổi mật khẩu thất bại');
      return false;
    }
  };

  const handleLogout = async () => {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    await removeData(STORAGE_KEYS.USER_PROFILE);
    dispatch(clearAuth());
  };

  return {
    user,
    profileError,
    clearProfileError,
    handleUpdateProfile,
    isUpdateProfileLoading,
    passwordError,
    clearPasswordError,
    handleChangePassword,
    isChangePasswordLoading,
    handleLogout,
  };
};
