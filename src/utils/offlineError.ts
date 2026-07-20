import type { OfflineBaseQueryError } from '@/types/network.types';

/** Check error có phải do mất mạng không (bất kể đã queue hay chưa) */
export const isOfflineError = (
  error: unknown,
): error is OfflineBaseQueryError =>
  Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as OfflineBaseQueryError).status === 'OFFLINE',
  );

/** Check error có phải "offline nhưng đã queue thành công" không (optimistic case) */
export const isQueuedOfflineError = (
  error: unknown,
): error is OfflineBaseQueryError =>
  isOfflineError(error) && Boolean((error as OfflineBaseQueryError).queued);

/**
 * Check error có phải "offline nhưng request đã bị TRIỆT TIÊU" không (vd
 * xoá rồi thêm lại cùng resourceKey lúc offline -> addToQueue trả null).
 * Khác isQueuedOfflineError ở chỗ: không có gì được lưu vào queue, server
 * vẫn giữ nguyên trạng thái gốc - do đó KHÔNG được tạo optimistic record
 * mới, chỉ nên khôi phục/giữ nguyên state hiện tại trong cache.
 */
export const isCancelledOfflineError = (
  error: unknown,
): error is OfflineBaseQueryError =>
  isOfflineError(error) && Boolean((error as OfflineBaseQueryError).cancelled);
