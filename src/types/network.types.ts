import type { AxiosRequestConfig } from 'axios';

export interface QueuedRequest {
  id: string;
  url: string;
  method: AxiosRequestConfig['method'];
  data?: unknown;
  params?: unknown;
  createdAt: number;
  invalidateTags?: string[];
  resourceKey?: string;
}

export interface OfflineBaseQueryError {
  status: 'OFFLINE';
  message: string;
  isOffline: true;
  queued?: boolean;
  cancelled?: boolean;
}

export type Pendable<T> = T & { _pendingSync?: boolean };
