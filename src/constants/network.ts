export const QUEUE_STORAGE_KEY = 'requestQueue';

export const SYNC_START_DELAY_MS = 1200;

export const OFFLINE_ERROR_STATUS = 'OFFLINE' as const;

export const NETWORK_TOAST_MESSAGE = {
  NO_CONNECTION: 'Không có mạng',
  QUEUED_SUCCESS: 'Đã lưu, sẽ đồng bộ khi có mạng',
  SYNC_SUCCESS: 'Đã đồng bộ dữ liệu offline',
  SYNC_FAILED: 'Đồng bộ thất bại, thử lại sau',
} as const;
