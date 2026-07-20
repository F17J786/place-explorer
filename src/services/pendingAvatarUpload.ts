import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pending_avatar_upload';

interface PendingAvatarUpload {
  userId: string;
  localUri: string;
}

export const setPendingAvatarUpload = async (
  userId: string,
  localUri: string,
): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify({ userId, localUri }));
};

export const getPendingAvatarUpload =
  async (): Promise<PendingAvatarUpload | null> => {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  };

export const clearPendingAvatarUpload = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY);
};
