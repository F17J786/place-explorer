import { configureStore } from '@reduxjs/toolkit';

import '@/store/api/authApi';
import { api } from '@/store/api/baseApi';
import authReducer from '@/store/slices/authSlice';
import mapReducer from '@/store/slices/mapSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    map: mapReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
