import CryptoJS from 'crypto-js';

import { CRYPTO_CONFIG } from '@/constants/cryptoKeys';

export default class CryptoService {
  static encrypt(data: unknown): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      CRYPTO_CONFIG.SECRET_KEY,
    ).toString();
  }

  static decrypt(cipherText: string) {
    const bytes = CryptoJS.AES.decrypt(cipherText, CRYPTO_CONFIG.SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
