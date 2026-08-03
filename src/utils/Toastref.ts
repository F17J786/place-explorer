type ShowToastFn = (msg: string, duration?: number) => void;

let toastFn: ShowToastFn | null = null;

export const registerToastFn = (fn: ShowToastFn | null) => {
  toastFn = fn;
};

export const showToast: ShowToastFn = (msg, duration) => {
  if (!toastFn) {
    if (__DEV__) {
      console.warn('[showToast] ToastProvider chưa mount, bỏ qua toast:', msg);
    }
    return;
  }
  toastFn(msg, duration);
};
