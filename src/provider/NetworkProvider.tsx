import React, { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { showToast } from '@/utils/toast';
import { syncQueue, getQueue, type SyncResult } from '@/services/offlineQueue';
import {
  NETWORK_TOAST_MESSAGE,
  SYNC_START_DELAY_MS,
} from '@/constants/network';
import { api } from '@/store/api/baseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useEncryptedStorage } from '@/hooks/useEncryptedStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { axiosInstance } from '@/services/axiosInstance';
import { clearPendingTags, runPostSyncSideEffects } from '@/services/postSync';
import { QueuedRequest } from '@/types/network.types';

type ApiTagType = 'User' | 'Place' | 'Review' | 'Favorite' | 'Checkin';

const parseTag = (tag: string): { type: ApiTagType; id?: string } => {
  const [type, id] = tag.split(':');
  return id ? { type: type as ApiTagType, id } : { type: type as ApiTagType };
};

let isSyncing = false;

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const userRef = useRef(user);
  userRef.current = user;
  const wasConnectedRef = useRef<boolean | null>(null);

  const handlePostSync = async (result: {
    synced: QueuedRequest[];
    failed: QueuedRequest[];
  }) => {
    const outcome = await runPostSyncSideEffects(result);

    if (outcome.updatedUser) {
      dispatch(setUser(outcome.updatedUser));
    } else if (outcome.avatarUpdated && userRef.current) {
      const res = await axiosInstance.get(`/users/${userRef.current.id}`);
      dispatch(setUser(res.data));
    }

    if (outcome.tags.length > 0) {
      dispatch(api.util.invalidateTags(outcome.tags));
      await clearPendingTags();
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
