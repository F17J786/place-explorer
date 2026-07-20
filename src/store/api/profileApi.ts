import { api } from '@/store/api/baseApi';
import type { User } from '@/types/user';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '@/types/profile.types';
import { axiosInstance } from '@/services/axiosInstance';
import { isOfflineError, isQueuedOfflineError } from '@/utils/offlineError';
import type { Pendable } from '@/types/network.types';
import { placeDetailApi } from './placeDetailApi';
import { setPendingAvatarUpload } from '@/services/pendingAvatarUpload';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
import NetInfo from '@react-native-community/netinfo';

type OptimisticUser = Pendable<User>;

export const profileApi = api.injectEndpoints({
  endpoints: builder => ({
    updateProfile: builder.mutation<User, UpdateProfilePayload>({
      queryFn: async ({ id, ...body }, _api, _extra, baseQuery) => {
        const isLocalAvatar =
          typeof body.avatar === 'string' && body.avatar.startsWith('file://');

        let patchBody = body;

        if (isLocalAvatar) {
          const netState = await NetInfo.fetch();

          if (netState.isConnected) {
            try {
              const uploadedUrl = await uploadImageToCloudinary(
                body.avatar as string,
              );
              patchBody = { ...body, avatar: uploadedUrl };
            } catch (e: any) {
              return {
                error: { status: 500, data: 'Tải ảnh đại diện thất bại' },
              };
            }
          } else {
            await setPendingAvatarUpload(String(id), body.avatar as string);
            const { avatar, ...rest } = body;
            patchBody = rest as typeof body;
          }
        }

        const result = await baseQuery({
          url: `/users/${id}`,
          method: 'PATCH',
          data: patchBody,
          invalidateTagsOnSync: [`User:${id}`],
          resourceKey: `profile:${id}`,
          offlineSuccessMessage: 'Cập nhật thông tin thành công',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            const optimisticUser: OptimisticUser = {
              id,
              ...body,
              _pendingSync: true,
            } as OptimisticUser;
            return { data: optimisticUser };
          }
          return { error: result.error };
        }

        return { data: result.data as User };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(
            placeDetailApi.util.updateQueryData('getUserById', id, draft => {
              Object.assign(draft, updatedUser);
            }),
          );
        } catch {}
      },
      invalidatesTags: (result, _err, arg) => {
        if ((result as OptimisticUser | undefined)?._pendingSync) return [];
        return [{ type: 'User', id: arg.id }];
      },
    }),

    changePassword: builder.mutation<null, ChangePasswordPayload>({
      queryFn: async (
        { id, oldPassword, newPassword },
        _api,
        _extra,
        baseQuery,
      ) => {
        const checkOnline = await baseQuery({
          url: `/users/${id}`,
          skipOfflineQueue: true,
        });

        if (checkOnline.error) {
          if (isOfflineError(checkOnline.error)) {
            return {
              error: {
                status: 0,
                data: 'Không có mạng. Vui lòng kết nối mạng để đổi mật khẩu',
              },
            };
          }
          return { error: checkOnline.error };
        }

        try {
          const user = checkOnline.data as User;

          if (user.password !== oldPassword) {
            return {
              error: { status: 400, data: 'Mật khẩu hiện tại không đúng' },
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
