import { showToast as showToastNative } from '@/utils/toast';

const DISPLAY_DURATION_MS = 1000;

type QueuedToast = {
  message: string;
  dedupeKey?: string;
};

const DEDUPE_WINDOW_MS = 5000;

let queue: QueuedToast[] = [];
let isProcessing = false;
const lastShownAtByKey = new Map<string, number>();

const processQueue = async (): Promise<void> => {
  if (isProcessing) return;
  console.log('[processQueue] start');

  isProcessing = true;

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;

    console.log('[processQueue] showToastNative:', next.message);
    showToastNative(next.message);

    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, DISPLAY_DURATION_MS));
    }
  }

  isProcessing = false;
  console.log('[processQueue] end');
};

export const enqueueToast = (message: string): void => {
  console.log('[enqueueToast]', message);

  queue.push({ message });
  console.log(
    '[enqueueToast] queue =',
    queue.map(x => x.message),
  );

  void processQueue();
};

export const enqueueToasts = (messages: string[]): void => {
  queue.push(...messages.map(message => ({ message })));
  void processQueue();
};

export const enqueueThrottledToast = (
  message: string,
  dedupeKey: string,
): void => {
  const lastShownAt = lastShownAtByKey.get(dedupeKey);
  const isStillThrottled =
    lastShownAt !== undefined && Date.now() - lastShownAt < DEDUPE_WINDOW_MS;

  if (isStillThrottled) return;

  lastShownAtByKey.set(dedupeKey, Date.now());
  queue.push({ message, dedupeKey });
  void processQueue();
};

export const clearToastQueue = (): void => {
  queue = [];
};

export const resetToastThrottle = (dedupeKey: string): void => {
  lastShownAtByKey.delete(dedupeKey);
};
