import i18n from 'i18next';

export const QUEUE_STORAGE_KEY = 'requestQueue';

export const SYNC_START_DELAY_MS = 1200;

export const OFFLINE_ERROR_STATUS = 'OFFLINE' as const;

export const NETWORK_TOAST_MESSAGE = {
  get NO_CONNECTION() {
    return i18n.t('common:offline.noConnection');
  },
  get QUEUED_SUCCESS() {
    return i18n.t('common:offline.queuedSuccess');
  },
  get SYNC_SUCCESS() {
    return i18n.t('common:offline.syncSuccess');
  },
  get SYNC_FAILED() {
    return i18n.t('common:offline.syncFailed');
  },
} as const;
