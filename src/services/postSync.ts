import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '@/services/axiosInstance';
import { saveEncryptedData } from '@/services/encryptedStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import {
  clearPendingAvatarUpload,
  getPendingAvatarUpload,
} from '@/services/pendingAvatarUpload';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
import type { QueuedRequest } from '@/types/network.types';
import type { SyncResult } from '@/services/offlineQueue';

type ApiTagType = 'User' | 'Place' | 'Review' | 'Favorite' | 'Checkin';

const PENDING_TAGS_KEY = 'pending_invalidate_tags';

const parseTag = (tag: string): { type: ApiTagType; id?: string } => {
  const [type, id] = tag.split(':');
  return id ? { type: type as ApiTagType, id } : { type: type as ApiTagType };
};

const collectTagsFromSynced = (synced: QueuedRequest[]) =>
  synced.flatMap(req => req.invalidateTags ?? []).map(parseTag);

interface PostSyncOutcome {
  tags: { type: ApiTagType; id?: string }[];
  updatedUser?: any;
  avatarUpdated?: boolean;
}

export const runPostSyncSideEffects = async (
  result: SyncResult,
): Promise<PostSyncOutcome> => {
  const tags = collectTagsFromSynced(result.synced);
  const outcome: PostSyncOutcome = { tags };
  let latestUser: any = null;

  const pendingAvatar = await getPendingAvatarUpload();
  if (pendingAvatar) {
    try {
      const uploadedUrl = await uploadImageToCloudinary(pendingAvatar.localUri);
      await axiosInstance.patch(`/users/${pendingAvatar.userId}`, {
        avatar: uploadedUrl,
      });
      await clearPendingAvatarUpload();
      tags.push({ type: 'User', id: pendingAvatar.userId });
      outcome.avatarUpdated = true;

      const res = await axiosInstance.get(`/users/${pendingAvatar.userId}`);
      latestUser = res.data;
    } catch (e) {
      console.log('[postSync] Upload avatar pending thất bại', e);
    }
  }

  const syncedProfileReq = result.synced.find(req =>
    req.resourceKey?.startsWith('profile:'),
  );

  if (syncedProfileReq) {
    const userId = syncedProfileReq.resourceKey?.split(':')[1];
    if (userId) {
      try {
        const res = await axiosInstance.get(`/users/${userId}`);
        outcome.updatedUser = res.data;
        latestUser = res.data;
      } catch (e) {
        console.log('[postSync] Fetch lại user sau sync thất bại', e);
      }
    }
  }

  if (latestUser) {
    try {
      await saveEncryptedData(STORAGE_KEYS.USER_PROFILE, latestUser);
    } catch (e) {
      console.log('[postSync] Ghi encrypted storage thất bại', e);
    }
  }

  if (tags.length > 0) {
    try {
      await AsyncStorage.setItem(PENDING_TAGS_KEY, JSON.stringify(tags));
    } catch (e) {
      console.log('[postSync] Lưu pending tags thất bại', e);
    }
  }

  return outcome;
};

export const readAndClearPendingTags = async (): Promise<
  { type: ApiTagType; id?: string }[]
> => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_TAGS_KEY);
    if (!raw) return [];
    await AsyncStorage.removeItem(PENDING_TAGS_KEY);
    return JSON.parse(raw);
  } catch (e) {
    console.log('[postSync] Đọc pending tags thất bại', e);
    return [];
  }
};

export const clearPendingTags = async () => {
  await AsyncStorage.removeItem(PENDING_TAGS_KEY);
};
