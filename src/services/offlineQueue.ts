import AsyncStorage from '@react-native-async-storage/async-storage';

import { axiosInstance } from '@/services/axiosInstance';
import { QUEUE_STORAGE_KEY } from '@/constants/network';
import type { QueuedRequest } from '@/types/network.types';

export const getQueue = async (): Promise<QueuedRequest[]> => {
  const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
};

const setQueue = async (queue: QueuedRequest[]) => {
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

export const addToQueue = async (
  request: Omit<QueuedRequest, 'id' | 'createdAt'>,
): Promise<QueuedRequest | null> => {
  const queue = await getQueue();

  console.log('[addToQueue] queue đầu vào', JSON.stringify(queue, null, 2));

  if (request.resourceKey) {
    console.log(
      '[findIndex]',
      request.method,
      request.resourceKey,
      queue.map(q => ({
        method: q.method,
        resourceKey: q.resourceKey,
      })),
    );
    const idx = queue.findIndex(q => q.resourceKey === request.resourceKey);
    console.log('[findIndex] idx =', idx);
    if (idx !== -1) {
      const old = queue[idx];
      console.log('[findIndex] old =', old);

      if (old.method === 'POST' && request.method === 'PATCH') {
        const merged: QueuedRequest = {
          ...old,
          data: {
            ...(old.data ?? {}),
            ...(request.data ?? {}),
          },
        };

        queue[idx] = merged;
        await setQueue(queue);

        console.log('[addToQueue] Merge PATCH vào POST:', request.resourceKey);

        return merged;
      }

      const isReview = request.resourceKey.startsWith('review:');

      if (isReview && old.method === 'DELETE' && request.method === 'POST') {
        const merged: QueuedRequest = {
          ...request,
          method: 'PATCH',
          url: old.url,
          id: old.id,
          createdAt: old.createdAt,
        };

        queue[idx] = merged;
        await setQueue(queue);

        console.log('[addToQueue] DELETE -> PATCH:', request.resourceKey);

        return merged;
      }

      const isFavorite = request.resourceKey.startsWith('favorite:');

      if (isFavorite && old.method === 'DELETE' && request.method === 'POST') {
        queue.splice(idx, 1);
        await setQueue(queue);

        console.log(
          '[addToQueue] Favorite: DELETE -> POST triệt tiêu nhau, bỏ khỏi queue',
        );

        return null;
      }

      if (old.method === request.method) {
        const merged: QueuedRequest = {
          ...request,
          id: old.id,
          createdAt: old.createdAt,
        };

        queue[idx] = merged;
        await setQueue(queue);

        console.log(
          '[addToQueue] Ghi đè cùng method:',
          old.method,
          request.method,
          request.resourceKey,
        );

        return merged;
      }
    }
  } else {
    const idx = queue.findIndex(
      q =>
        !q.resourceKey && q.method === request.method && q.url === request.url,
    );
    if (idx !== -1) {
      const old = queue[idx];
      const merged: QueuedRequest = {
        ...request,
        id: old.id,
        createdAt: old.createdAt,
      };
      queue[idx] = merged;
      await setQueue(queue);

      console.log(
        '[addToQueue] Ghi đè request trùng (no resourceKey):',
        request.method,
        request.url,
      );
      console.log('[addToQueue] queue sau', JSON.stringify(queue, null, 2));

      return merged;
    }
  }

  const entry: QueuedRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  queue.push(entry);
  await setQueue(queue);
  console.log('[addToQueue] queue sau', JSON.stringify(queue, null, 2));
  return entry;
};

export const cancelQueuedRequestByResourceKey = async (
  resourceKey: string,
): Promise<boolean> => {
  const queue = await getQueue();
  const idx = queue.findIndex(q => q.resourceKey === resourceKey);
  if (idx === -1) return false;

  queue.splice(idx, 1);
  await setQueue(queue);
  console.log('[cancelQueuedRequestByResourceKey] Đã hủy:', resourceKey);
  return true;
};

export const cancelQueuedRequest = async (
  resourceKey: string,
  method: 'POST' | 'PATCH' | 'DELETE',
): Promise<boolean> => {
  const queue = await getQueue();
  const idx = queue.findIndex(
    q => q.resourceKey === resourceKey && q.method === method,
  );
  if (idx === -1) {
    console.log('[cancelQueuedRequest] Không tìm thấy:', resourceKey, method);
    return false;
  }

  queue.splice(idx, 1);
  await setQueue(queue);

  console.log('[cancelQueuedRequest] Đã huỷ:', resourceKey, method);
  return true;
};

export const clearQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
};

export interface SyncResult {
  synced: QueuedRequest[];
  failed: QueuedRequest[];
}

let isSyncRunning = false;

export const syncQueue = async (): Promise<SyncResult | null> => {
  const queue = await getQueue();
  console.log('[syncQueue] Queue trước khi sync:', queue);
  if (queue.length === 0) return null;

  if (isSyncRunning) {
    console.log('[syncQueue] Đang có sync khác chạy, bỏ qua');
    return null;
  }

  isSyncRunning = true;

  try {
    const results = await Promise.allSettled(
      queue.map(req =>
        axiosInstance({ url: req.url, method: req.method, data: req.data }),
      ),
    );

    const synced: QueuedRequest[] = [];
    const failed: QueuedRequest[] = [];

    results.forEach((result, index) => {
      const req = queue[index];
      if (result.status === 'fulfilled') {
        console.log(`[syncQueue] OK: ${req.method} ${req.url}`);
        synced.push(req);
      } else {
        console.log(
          `[syncQueue] FAIL: ${req.method} ${req.url}`,
          (result as PromiseRejectedResult).reason?.message ??
            (result as PromiseRejectedResult).reason,
        );
        failed.push(req);
      }
    });

    await setQueue(failed);
    return { synced, failed };
  } finally {
    isSyncRunning = false;
  }
};
