import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import { axiosInstance } from '@/services/axiosInstance';
import { addToQueue } from '@/services/offlineQueue';
import {
  enqueueToast,
  enqueueThrottledToast,
  enqueueToasts,
} from '@/services/toastQueue';
import {
  NETWORK_TOAST_MESSAGE,
  OFFLINE_ERROR_STATUS,
} from '@/constants/network';
import type { OfflineBaseQueryError } from '@/types/network.types';

const NO_CONNECTION_DEDUPE_KEY = 'network:no-connection';

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  skipOfflineQueue?: boolean;
  invalidateTagsOnSync?: string[];
  offlineSuccessMessage?: string;
  resourceKey?: string;
  suppressOfflineToast?: boolean;
}

interface AxiosBaseQueryError {
  status?: number;
  data: unknown;
}

const CACHE_PREFIX = 'gc_';

const buildCacheKey = (url: string, params?: unknown) =>
  `${CACHE_PREFIX}${url}${params ? JSON.stringify(params) : ''}`;

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError | OfflineBaseQueryError
  > =>
  async ({
    url,
    method = 'GET',
    data,
    params,
    skipOfflineQueue,
    invalidateTagsOnSync,
    offlineSuccessMessage,
    resourceKey,
    suppressOfflineToast,
  }) => {
    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected;
    const cacheKey = buildCacheKey(url, params);

    if (isOffline) {
      if (method !== 'GET' && !skipOfflineQueue) {
        console.log('[axiosBaseQuery] addToQueue', {
          method,
          url,
          resourceKey,
        });
        const queueResult = await addToQueue({
          url,
          method,
          data,
          params,
          invalidateTags: invalidateTagsOnSync,
          resourceKey,
        });

        const wasCancelled = queueResult === null;

        if (wasCancelled) {
          return {
            error: {
              status: OFFLINE_ERROR_STATUS,
              message:
                'Không có mạng, thao tác đã bị huỷ do triệt tiêu request trước đó',
              isOffline: true,
              queued: false,
              cancelled: true,
            },
          };
        }

        enqueueToasts([
          NETWORK_TOAST_MESSAGE.NO_CONNECTION,
          offlineSuccessMessage ?? NETWORK_TOAST_MESSAGE.QUEUED_SUCCESS,
        ]);

        return {
          error: {
            status: OFFLINE_ERROR_STATUS,
            message: 'Không có mạng, đã lưu để đồng bộ sau',
            isOffline: true,
            queued: true,
          },
        };
      }

      if (method === 'GET') {
        const cached = await AsyncStorage.getItem(cacheKey);

        if (cached) {
          console.log('[GET offline]', {
            url,
            params,
            suppressOfflineToast,
          });
          if (!suppressOfflineToast) {
            console.log('>>> WILL SHOW OFFLINE TOAST', {
              url,
              params,
              suppressOfflineToast,
            });

            enqueueThrottledToast(
              NETWORK_TOAST_MESSAGE.NO_CONNECTION,
              NO_CONNECTION_DEDUPE_KEY,
            );
          }

          return {
            data: JSON.parse(cached),
            meta: {
              fromCache: true,
            },
          };
        }
      }

      if (!suppressOfflineToast) {
        console.log('>>> WILL SHOW OFFLINE TOAST', {
          url,
          params,
          suppressOfflineToast,
        });
        enqueueThrottledToast(
          NETWORK_TOAST_MESSAGE.NO_CONNECTION,
          NO_CONNECTION_DEDUPE_KEY,
        );
      }

      return {
        error: {
          status: OFFLINE_ERROR_STATUS,
          message: 'Không có mạng',
          isOffline: true,
        },
      };
    }

    try {
      const result = await axiosInstance({ url, method, data, params });

      if (method === 'GET') {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(result.data));
      }

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };
