import axios from 'axios';
import * as Keychain from 'react-native-keychain';

import { API_TIMEOUT_MS, BASE_URL } from '@/constants/api';
import { KEYCHAIN_SERVICE } from '@/constants/keychain';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: params => {
    return Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join('&');
  },
});

axiosInstance.interceptors.request.use(async config => {
  const credentials = await Keychain.getGenericPassword({
    service: KEYCHAIN_SERVICE,
  });

  console.log('=== REQUEST ===');
  console.log('baseURL:', config.baseURL); // thêm dòng này
  console.log('URL:', config.url);
  console.log('Full URL:', (config.baseURL ?? '') + config.url); // full URL thật
  console.log('Params:', config.params); // thêm dòng này
  console.log('Method:', config.method);
  console.log('Token exists:', !!credentials);
  const fullUrl = axios.getUri(config);
  console.log('Full URL with params:', fullUrl);

  if (credentials) {
    config.headers.Authorization = `Bearer ${credentials.password}`;

    console.log(
      'Authorization:',
      `Bearer ${credentials.password.substring(0, 20)}...`,
    );
  }

  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('=== RESPONSE ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);

    return response;
  },
  async error => {
    console.log('=== ERROR ===');
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    console.log('Data:', error.response?.data);

    if (error.response?.status === 401) {
      console.log('401 -> Clear token');

      await Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE,
      });
    }

    return Promise.reject(error);
  },
);
