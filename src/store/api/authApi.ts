import type { LoginFormValues } from '@/types/auth.types';
import type { RegisterUserPayload, User } from '@/types/user';
import { api } from '@/store/api/baseApi';

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
        });

        if (result.error) {
          return { error: result.error };
        }

        const users = result.data as User[];

        if (users.length === 0) {
          return { error: createAuthError(404, 'Email không tồn tại') };
        }

        const matchedUser = users[0];

        if (matchedUser.password !== password) {
          return { error: createAuthError(401, 'Mật khẩu không đúng') };
        }

        return { data: matchedUser };
      },
    }),
    register: builder.mutation<User, RegisterUserPayload>({
      queryFn: async (payload, _api, _extraOptions, baseQuery) => {
        // GET all users, không filter params
        const existingResult = await baseQuery({
          url: '/users',
        });

        if (existingResult.error) {
          return { error: existingResult.error };
        }

        const existingUsers = existingResult.data as User[];

        // Filter client-side
        const emailExists = existingUsers.some(
          u => u.email.toLowerCase() === payload.email.toLowerCase(),
        );

        if (emailExists) {
          return { error: createAuthError(409, 'Email đã được sử dụng') };
        }

        const createResult = await baseQuery({
          url: '/users',
          method: 'POST',
          data: payload,
        });

        if (createResult.error) {
          return { error: createResult.error };
        }

        return { data: createResult.data as User };
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
