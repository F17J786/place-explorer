import { createApi } from '@reduxjs/toolkit/query/react';

import { BASE_URL } from '@/constants/api';
import { axiosBaseQuery } from '@/services/axiosBaseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Place', 'Review', 'Favorite', 'User'],
  endpoints: () => ({}),
});
