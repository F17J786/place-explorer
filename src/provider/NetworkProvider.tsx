import React, { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { showToast } from '@/utils/toast';
import { syncQueue, getQueue } from '@/services/offlineQueue';
import {
  NETWORK_TOAST_MESSAGE,
  SYNC_START_DELAY_MS,
} from '@/constants/network';
import { api } from '@/store/api/baseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useEncryptedStorage } from '@/hooks/useEncryptedStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { QueuedRequest } from '@/types/network.types';
import {
  clearPendingAvatarUpload,
  getPendingAvatarUpload,
} from '@/services/pendingAvatarUpload';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
import { axiosInstance } from '@/services/axiosInstance';

type ApiTagType = 'User' | 'Place' | 'Review' | 'Favorite' | 'Checkin';

const parseTag = (tag: string): { type: ApiTagType; id?: string } => {
  const [type, id] = tag.split(':');
  return id ? { type: type as ApiTagType, id } : { type: type as ApiTagType };
};

const collectTagsFromSynced = (synced: QueuedRequest[]) =>
  synced.flatMap(req => req.invalidateTags ?? []).map(parseTag);

let isSyncing = false;

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const userRef = useRef(user);
  userRef.current = user;
  const { saveData } = useEncryptedStorage();
  const wasConnectedRef = useRef<boolean | null>(null);

  const handlePostSync = async (result: {
    synced: QueuedRequest[];
    failed: QueuedRequest[];
  }) => {
    console.log(
      '[NetworkProvider][DEBUG] handlePostSync result.synced =',
      JSON.stringify(result.synced, null, 2),
    );

    const tags = collectTagsFromSynced(result.synced);

    const pendingAvatar = await getPendingAvatarUpload();
    if (pendingAvatar) {
      try {
        const uploadedUrl = await uploadImageToCloudinary(
          pendingAvatar.localUri,
        );
        await axiosInstance.patch(`/users/${pendingAvatar.userId}`, {
          avatar: uploadedUrl,
        });
        await clearPendingAvatarUpload();
        tags.push({ type: 'User', id: pendingAvatar.userId });

        if (
          userRef.current &&
          String(userRef.current.id) === pendingAvatar.userId
        ) {
          const updatedUser = { ...userRef.current, avatar: uploadedUrl };
          dispatch(setUser(updatedUser));
          await saveData(STORAGE_KEYS.USER_PROFILE, updatedUser);
        }
      } catch (e) {
        console.log(
          '[NetworkProvider] Upload avatar pending thất bại, giữ lại để thử lần sau',
          e,
        );
      }
    }

    const syncedProfileReq = result.synced.find(req =>
      req.resourceKey?.startsWith('profile:'),
    );

    console.log(
      '[NetworkProvider][DEBUG] syncedProfileReq =',
      JSON.stringify(syncedProfileReq, null, 2),
      'userRef.current =',
      JSON.stringify(userRef.current, null, 2),
    );

    if (syncedProfileReq && userRef.current) {
      try {
        const res = await axiosInstance.get(`/users/${userRef.current.id}`);
        const freshUser = res.data;
        dispatch(setUser(freshUser));
        await saveData(STORAGE_KEYS.USER_PROFILE, freshUser);
        console.log('[NetworkProvider][DEBUG] Đã update Redux + storage');
      } catch (e) {
        console.log('[NetworkProvider] Fetch lại user sau sync thất bại', e);
      }
    }

    if (tags.length > 0) {
      dispatch(api.util.invalidateTags(tags));
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const isConnected = Boolean(state.isConnected);
      const wasConnected = wasConnectedRef.current;
      wasConnectedRef.current = isConnected;

      if (wasConnected === null) {
        if (isConnected) {
          const queue = await getQueue();

          if (queue.length > 0 && !isSyncing) {
            isSyncing = true;

            try {
              const result = await syncQueue();
              if (result) {
                await handlePostSync(result);
              }
            } finally {
              isSyncing = false;
            }
          }
        }

        return;
      }

      if (!isConnected && wasConnected) {
        console.log('[NetworkProvider] NO_CONNECTION');

        showToast(NETWORK_TOAST_MESSAGE.NO_CONNECTION);
        return;
      }

      if (isConnected && !wasConnected) {
        if (isSyncing) {
          console.log('[NetworkProvider] Sync đang chạy, bỏ qua trigger này');
          return;
        }

        const queue = await getQueue();
        if (queue.length === 0) return;

        isSyncing = true;
        try {
          await new Promise(resolve =>
            setTimeout(resolve, SYNC_START_DELAY_MS),
          );

          const freshState = await NetInfo.fetch();
          if (freshState.isInternetReachable === false) {
            console.log(
              '[NetworkProvider] isConnected nhưng chưa có internet thật, bỏ qua lần trigger này',
            );

            wasConnectedRef.current = false;
            return;
          }

          let result = await syncQueue();
          if (!result) return;

          if (result.failed.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryResult = await syncQueue();
            if (retryResult) {
              result = {
                synced: [...result.synced, ...retryResult.synced],
                failed: retryResult.failed,
              };
            }
          }

          await handlePostSync(result);

          if (result.failed.length === 0) {
            showToast(NETWORK_TOAST_MESSAGE.SYNC_SUCCESS);
          } else if (result.synced.length > 0) {
            showToast(
              `Đồng bộ ${result.synced.length}/${
                result.synced.length + result.failed.length
              } mục`,
            );
          } else {
            showToast(NETWORK_TOAST_MESSAGE.SYNC_FAILED);
          }
        } finally {
          isSyncing = false;
        }
      }
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
};
