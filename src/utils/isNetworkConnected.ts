import NetInfo from '@react-native-community/netinfo';

import { showToast } from '@/utils/toast';
import { NETWORK_TOAST_MESSAGE } from '@/constants/network';

const TOAST_DEDUPE_WINDOW_MS = 3000;
let lastOfflineToastAt = 0;

/**
 * Dùng cho các service gọi thẳng axios (không qua axiosBaseQuery) tới API
 * bên ngoài như Nominatim, OSRM, Overpass. Tự toast "Không có mạng" ở đây
 * luôn (không đẩy qua component) vì các service này không đi qua
 * axiosBaseQuery nên không được toast tự động.
 *
 * Có dedupe theo thời gian: search-as-you-type gọi hàm search liên tục mỗi
 * ký tự, nếu toast mỗi lần gọi sẽ spam toast liên tục lúc offline.
 */
export const isNetworkConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  const connected = Boolean(state.isConnected);

  if (!connected) {
    const now = Date.now();
    if (now - lastOfflineToastAt > TOAST_DEDUPE_WINDOW_MS) {
      showToast(NETWORK_TOAST_MESSAGE.NO_CONNECTION);
      lastOfflineToastAt = now;
    }
  }

  return connected;
};
