// Module-level ref — KHÔNG phải React state.
// Cho phép gọi showToast() từ ngoài component tree:
// axiosBaseQuery, NetworkProvider, headless task, toastQueue.ts, v.v.

type ShowToastFn = (msg: string, duration?: number) => void;

// null cho tới khi ToastProvider mount xong
let toastFn: ShowToastFn | null = null;

/**
 * Gọi từ bên trong ToastProvider khi mount, để "đăng ký" hàm show thật.
 */
export const registerToastFn = (fn: ShowToastFn | null) => {
  toastFn = fn;
};

/**
 * API public — dùng y hệt như showToast(msg) của @baronha/ting trước đây.
 * Nếu ToastProvider chưa mount (ví dụ gọi quá sớm lúc app khởi động),
 * sẽ warn thay vì crash.
 */
export const showToast: ShowToastFn = (msg, duration) => {
  if (!toastFn) {
    if (__DEV__) {
      console.warn('[showToast] ToastProvider chưa mount, bỏ qua toast:', msg);
    }
    return;
  }
  toastFn(msg, duration);
};
