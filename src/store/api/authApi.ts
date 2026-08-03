import type { LoginFormValues } from '@/types/auth.types';
import type { RegisterUserPayload, User } from '@/types/user';
import { api } from '@/store/api/baseApi';
import { isOfflineError } from '@/utils/offlineError';
import i18n from 'i18next';

interface AuthApiError {
  status: number;
  data: string;
}

const createAuthError = (status: number, message: string): AuthApiError => ({
  status,
  data: message,
});

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<User, LoginFormValues>({
      queryFn: async ({ email, password }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: '/users',
          params: { email },
          skipOfflineQueue: true,
        });

        if (result.error) {
          if (isOfflineError(result.error)) {
            return {
              error: createAuthError(0, i18n.t('auth:apiError.offlineLogin')),
            };
          }
          return { error: result.error };
        }

        const users = result.data as User[];

        if (users.length === 0) {
          return {
            error: createAuthError(404, i18n.t('auth:apiError.emailNotFound')),
          };
        }

        const matchedUser = users[0];

        if (matchedUser.password !== password) {
          return {
            error: createAuthError(401, i18n.t('auth:apiError.wrongPassword')),
          };
        }

        return { data: matchedUser };
      },
    }),
    register: builder.mutation<User, RegisterUserPayload>({
      queryFn: async (payload, _api, _extraOptions, baseQuery) => {
        const existingResult = await baseQuery({
          url: '/users',
          skipOfflineQueue: true,
        });

        if (existingResult.error) {
          if (isOfflineError(existingResult.error)) {
            return {
              error: createAuthError(
                0,
                i18n.t('auth:apiError.offlineRegister'),
              ),
            };
          }
          return { error: existingResult.error };
        }

        const existingUsers = existingResult.data as User[];

        const emailExists = existingUsers.some(
          u => u.email.toLowerCase() === payload.email.toLowerCase(),
        );

        if (emailExists) {
          return {
            error: createAuthError(409, i18n.t('auth:apiError.emailTaken')),
          };
        }

        const createResult = await baseQuery({
          url: '/users',
          method: 'POST',
          data: payload,
          skipOfflineQueue: true,
        });

        if (createResult.error) {
          if (isOfflineError(createResult.error)) {
            return {
              error: createAuthError(
                0,
                i18n.t('auth:apiError.offlineRegister'),
              ),
            };
          }
          return { error: createResult.error };
        }

        return { data: createResult.data as User };
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
