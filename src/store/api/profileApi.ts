import { api } from '@/store/api/baseApi';
import type { User } from '@/types/user';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '@/types/profile.types';
import { axiosInstance } from '@/services/axiosInstance';

export const profileApi = api.injectEndpoints({
  endpoints: builder => ({
    updateProfile: builder.mutation<User, UpdateProfilePayload>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'User', id: arg.id }],
    }),

    changePassword: builder.mutation<null, ChangePasswordPayload>({
      queryFn: async ({ id, oldPassword, newPassword }) => {
        try {
          const { data: user } = await axiosInstance.get<User>(`/users/${id}`);

          if (user.password !== oldPassword) {
            return {
              error: {
                status: 400,
                data: 'Mật khẩu hiện tại không đúng',
              },
            };
          }

          await axiosInstance.patch(`/users/${id}`, {
            password: newPassword,
          });

          return { data: null };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      invalidatesTags: (_result, _err, arg) => [{ type: 'User', id: arg.id }],
    }),
  }),
});

export const { useUpdateProfileMutation, useChangePasswordMutation } =
  profileApi;
