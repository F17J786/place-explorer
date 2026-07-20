import { api } from '@/store/api/baseApi';
import type {
  Review,
  Favorite,
  Checkin,
  PlaceRecord,
  CreateReviewPayload,
  CreateCheckinPayload,
  CreateFavoritePayload,
  UpdateReviewPayload,
} from '@/types/placeDetail.types';
import { axiosInstance } from '@/services/axiosInstance';
import {
  isQueuedOfflineError,
  isCancelledOfflineError,
} from '@/utils/offlineError';
import type { Pendable } from '@/types/network.types';
import {
  cancelQueuedRequest,
  cancelQueuedRequestByResourceKey,
} from '@/services/offlineQueue';
import type { RootState } from '@/store';
import { enqueueToast, enqueueToasts } from '@/services/toastQueue';
import {
  NETWORK_TOAST_MESSAGE,
  OFFLINE_ERROR_STATUS,
} from '@/constants/network';
import {
  savePendingDeletedFavorite,
  getPendingDeletedFavorite,
  clearPendingDeletedFavorite,
} from '@/services/pendingDeletedFavoritesCache';

type OptimisticReview = Pendable<Review>;
type OptimisticCheckin = Pendable<Checkin>;
type OptimisticFavorite = Pendable<Favorite>;

const genOfflineId = () =>
  `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const placeDetailApi = api.injectEndpoints({
  endpoints: builder => ({
    getPlaceByOsmId: builder.query<PlaceRecord | null, string>({
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/places',
          params: { osmId },
          suppressOfflineToast: true,
        });
        if (result.error) return { error: result.error };
        const list = result.data as PlaceRecord[];
        return { data: list[0] ?? null };
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Place', id: osmId }],
    }),

    getPlacesByOsmIds: builder.query<PlaceRecord[], string[]>({
      queryFn: async (osmIds, _api, _extra, baseQuery) => {
        const results = await Promise.allSettled(
          osmIds.map(osmId =>
            baseQuery({
              url: '/places',
              params: { osmId },
              suppressOfflineToast: true,
            }),
          ),
        );
        const places: PlaceRecord[] = [];
        results.forEach(r => {
          if (r.status === 'fulfilled' && !r.value.error) {
            const list = r.value.data as PlaceRecord[];
            if (list[0]) places.push(list[0]);
          }
        });
        return { data: places };
      },
      providesTags: (_result, _err, osmIds) =>
        osmIds.map(id => ({ type: 'Place' as const, id })),
    }),

    upsertPlace: builder.mutation<
      PlaceRecord,
      Omit<PlaceRecord, 'id' | 'createdAt'>
    >({
      queryFn: async (payload, _api, _extra, baseQuery) => {
        const existing = await baseQuery({
          url: '/places',
          params: { osmId: payload.osmId },
          skipOfflineQueue: true,
          suppressOfflineToast: true,
        });
        if (existing.error) return { error: existing.error };
        const list = existing.data as PlaceRecord[];

        if (list.length > 0) {
          return { data: list[0] };
        }

        const created = await baseQuery({
          url: '/places',
          method: 'POST',
          data: { ...payload, createdAt: new Date().toISOString() },
          skipOfflineQueue: true,
          suppressOfflineToast: true,
        });
        if (created.error) return { error: created.error };
        return { data: created.data as PlaceRecord };
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Place', id: arg.osmId },
      ],
    }),

    getReviewsByOsmId: builder.query<Review[], string>({
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/reviews',
          params: { osmId, _sort: '-createdAt' },
        });
        if (result.error) return { error: result.error };
        const reviews = result.data as Review[];

        const userIds = [...new Set(reviews.map(r => r.userId))];
        const userMap: Record<
          string,
          { id: string; name: string; avatar: string }
        > = {};

        await Promise.allSettled(
          userIds.map(async uid => {
            const userResult = await baseQuery({
              url: `/users/${uid}`,
              skipOfflineQueue: true,
            });
            if (!userResult.error) {
              const user = userResult.data as {
                id: string;
                name: string;
                avatar: string;
              };
              userMap[uid] = {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              };
            }
          }),
        );

        return {
          data: reviews.map(r => ({
            ...r,
            user: userMap[r.userId] ?? undefined,
          })),
        };
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Review', id: osmId }],
    }),

    createReview: builder.mutation<Review, CreateReviewPayload>({
      queryFn: async (payload, api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/reviews',
          method: 'POST',
          data: { ...payload, userId: Number(payload.userId) },
          resourceKey: `review:${payload.userId}:${payload.osmId}`,
          invalidateTagsOnSync: [
            `Review:${payload.osmId}`,
            `Review:user-${payload.userId}`,
          ],
          offlineSuccessMessage: 'Đã thêm đánh giá!',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            const currentUser = (api.getState() as any)?.auth?.user;
            const optimisticReview: OptimisticReview = {
              ...payload,
              id: genOfflineId(),
              userId: String(payload.userId),
              createdAt: new Date().toISOString(),
              _pendingSync: true,
              user: currentUser
                ? {
                    id: String(currentUser.id),
                    name: currentUser.name,
                    avatar: currentUser.avatar,
                  }
                : undefined,
            } as OptimisticReview;
            return { data: optimisticReview };
          }
          return { error: result.error };
        }

        return { data: result.data as Review };
      },
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data: newReview } = await queryFulfilled;
          dispatch(
            placeDetailApi.util.updateQueryData(
              'getReviewsByOsmId',
              payload.osmId,
              draft => {
                draft.unshift(newReview);
              },
            ),
          );
        } catch {}
      },
      invalidatesTags: (result, _err, arg) => {
        if ((result as OptimisticReview | undefined)?._pendingSync) return [];
        return [
          { type: 'Review', id: arg.osmId },
          { type: 'Review', id: `user-${arg.userId}` },
        ];
      },
    }),

    updateReview: builder.mutation<Review, UpdateReviewPayload>({
      queryFn: async ({ id, ...body }, api, _extra, baseQuery) => {
        const state = api.getState() as RootState;
        const userId = state.auth.user?.id;
        const result = await baseQuery({
          url: `/reviews/${id}`,
          method: 'PATCH',
          data: body,
          resourceKey: `review:${userId}:${body.osmId}`,
          invalidateTagsOnSync: [
            `Review:${(body as UpdateReviewPayload).osmId}`,
          ],
          offlineSuccessMessage: 'Đã cập nhật đánh giá!',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            const optimisticReview: OptimisticReview = {
              id,
              ...body,
              _pendingSync: true,
            } as OptimisticReview;
            return { data: optimisticReview };
          }
          return { error: result.error };
        }

        return { data: result.data as Review };
      },
      async onQueryStarted({ id, osmId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;
          dispatch(
            placeDetailApi.util.updateQueryData(
              'getReviewsByOsmId',
              osmId,
              draft => {
                const idx = draft.findIndex(r => r.id === id);
                if (idx !== -1) draft[idx] = { ...draft[idx], ...updated };
              },
            ),
          );
        } catch {}
      },
      invalidatesTags: (result, _err, arg) => {
        if ((result as OptimisticReview | undefined)?._pendingSync) return [];
        return [
          { type: 'Review', id: arg.osmId },
          ...(result
            ? [{ type: 'Review' as const, id: `user-${result.userId}` }]
            : []),
        ];
      },
    }),

    deleteReview: builder.mutation<
      null,
      { id: string; osmId: string; userId: string }
    >({
      queryFn: async ({ id, osmId, userId }, _api, _extra, baseQuery) => {
        const resourceKey = `review:${userId}:${osmId}`;

        if (id.startsWith('offline-')) {
          await cancelQueuedRequestByResourceKey(resourceKey);
          enqueueToasts([
            NETWORK_TOAST_MESSAGE.NO_CONNECTION,
            'Đã xoá đánh giá!',
          ]);
          return {
            data: null,
            meta: { pendingSync: true },
          };
        }

        const result = await baseQuery({
          url: `/reviews/${id}`,
          method: 'DELETE',
          resourceKey,
          invalidateTagsOnSync: [`Review:${osmId}`, `Review:user-${userId}`],
          offlineSuccessMessage: 'Đã xoá đánh giá!',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            return { data: null, meta: { pendingSync: true } };
          }
          return { error: result.error };
        }

        return { data: null };
      },
      async onQueryStarted({ id, osmId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          placeDetailApi.util.updateQueryData(
            'getReviewsByOsmId',
            osmId,
            draft => {
              const idx = draft.findIndex(r => r.id === id);
              if (idx !== -1) draft.splice(idx, 1);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _err, arg, meta) => {
        if ((meta as { pendingSync?: boolean } | undefined)?.pendingSync) {
          return [];
        }
        return [
          { type: 'Review', id: arg.osmId },
          { type: 'Review', id: `user-${arg.userId}` },
        ];
      },
    }),

    getFavoritesByUser: builder.query<
      Favorite[],
      {
        userId: string | number;
        suppressOfflineToast?: boolean;
      }
    >({
      queryFn: async (
        { userId, suppressOfflineToast },
        _api,
        _extra,
        baseQuery,
      ) => {
        const result = await baseQuery({
          url: '/favorites',
          params: {
            userId: Number(userId),
          },
          suppressOfflineToast,
        });
        if (result.error) return { error: result.error };
        return { data: result.data as Favorite[] };
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${String(queryArgs.userId)})`,
      providesTags: (_result, _err, userId) => [
        { type: 'Favorite', id: `list-${String(userId)}` },
      ],
    }),

    getFavoriteByUser: builder.query<
      Favorite | null,
      { userId: string; osmId: string }
    >({
      queryFn: async ({ userId, osmId }, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/favorites',
          params: { userId: Number(userId), osmId },
          suppressOfflineToast: true,
        });
        if (result.error) return { error: result.error };
        const list = result.data as Favorite[];
        return { data: list[0] ?? null };
      },
      providesTags: (_result, _err, arg) => [
        { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
      ],
    }),

    addFavorite: builder.mutation<Favorite, CreateFavoritePayload>({
      queryFn: async (payload, api, _extra, baseQuery) => {
        const userIdStr = String(payload.userId);

        const existing = await baseQuery({
          url: '/favorites',
          params: { userId: Number(payload.userId), osmId: payload.osmId },
          skipOfflineQueue: true,
          suppressOfflineToast: true,
        });

        console.log('existing.error', existing.error);
        console.log('existing.data', existing.data);

        if (!existing.error && !(existing.meta as any)?.fromCache) {
          const list = existing.data as Favorite[];
          if (list.length > 0) {
            clearPendingDeletedFavorite(userIdStr, payload.osmId);
            return { data: list[0] };
          }
        }

        const result = await baseQuery({
          url: '/favorites',
          method: 'POST',
          data: { ...payload, userId: Number(payload.userId) },
          resourceKey: `favorite:${payload.userId}:${payload.osmId}`,
          invalidateTagsOnSync: [
            `Favorite:${payload.userId}-${payload.osmId}`,
            `Favorite:list-${payload.userId}`,
          ],
          offlineSuccessMessage: 'Đã thêm vào yêu thích!',
        });

        if (result.error) {
          console.log('[addFavorite] result.error =', result.error);
          console.log(
            '[addFavorite] isCancelledOfflineError =',
            isCancelledOfflineError(result.error),
          );
          console.log(
            '[addFavorite] pendingDeletedFavorite =',
            getPendingDeletedFavorite(userIdStr, payload.osmId),
          );

          if (isCancelledOfflineError(result.error)) {
            const original = getPendingDeletedFavorite(
              userIdStr,
              payload.osmId,
            );

            enqueueToasts([
              NETWORK_TOAST_MESSAGE.NO_CONNECTION,
              'Đã thêm vào yêu thích!',
            ]);

            if (original) {
              clearPendingDeletedFavorite(userIdStr, payload.osmId);
              return { data: original };
            }

            return {
              error: {
                status: OFFLINE_ERROR_STATUS,
                message:
                  'Không thể khôi phục favorite gốc sau khi request bị triệt tiêu',
                isOffline: true,
              },
            };
          }

          if (isQueuedOfflineError(result.error)) {
            const optimisticFavorite: OptimisticFavorite = {
              ...payload,
              id: genOfflineId(),
              userId: userIdStr,
              _pendingSync: true,
            } as OptimisticFavorite;
            return { data: optimisticFavorite };
          }
          return { error: result.error };
        }

        clearPendingDeletedFavorite(userIdStr, payload.osmId);
        return { data: result.data as Favorite };
      },
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data: newFavorite } = await queryFulfilled;

          dispatch(
            placeDetailApi.util.updateQueryData(
              'getFavoritesByUser',
              {
                userId: String(payload.userId),
              },
              draft => {
                const alreadyInList = draft.some(f => f.id === newFavorite.id);
                if (!alreadyInList) {
                  draft.push(newFavorite);
                }
              },
            ),
          );

          dispatch(
            placeDetailApi.util.updateQueryData(
              'getFavoriteByUser',
              { userId: String(payload.userId), osmId: payload.osmId },
              () => newFavorite,
            ),
          );
        } catch {}
      },
      invalidatesTags: (result, _err, arg) => {
        if ((result as OptimisticFavorite | undefined)?._pendingSync) return [];
        return [
          { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
          { type: 'Favorite', id: `list-${arg.userId}` },
        ];
      },
    }),

    removeFavorite: builder.mutation<
      null,
      { id: string; userId: string; osmId: string }
    >({
      queryFn: async ({ id, userId, osmId }, api, _extra, baseQuery) => {
        const resourceKey = `favorite:${userId}:${osmId}`;
        console.log('[removeFavorite]', {
          id,
          resourceKey,
          isOfflineId: id.startsWith('offline-'),
        });

        const cachedSelector =
          placeDetailApi.endpoints.getFavoriteByUser.select({
            userId: String(userId),
            osmId,
          });
        const cached = cachedSelector(api.getState() as RootState).data;
        if (cached) {
          savePendingDeletedFavorite(String(userId), osmId, cached);
        }

        if (id.startsWith('offline-')) {
          enqueueToasts([
            NETWORK_TOAST_MESSAGE.NO_CONNECTION,
            'Đã xoá khỏi yêu thích!',
          ]);

          await cancelQueuedRequest(resourceKey, 'POST');
          clearPendingDeletedFavorite(String(userId), osmId);

          return { data: null, meta: { pendingSync: true } };
        }

        const result = await baseQuery({
          url: `/favorites/${id}`,
          method: 'DELETE',
          resourceKey,
          invalidateTagsOnSync: [
            `Favorite:${userId}-${osmId}`,
            `Favorite:list-${userId}`,
          ],
          offlineSuccessMessage: 'Đã xoá khỏi yêu thích!',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            return { data: null, meta: { pendingSync: true } };
          }

          if (isCancelledOfflineError(result.error)) {
            clearPendingDeletedFavorite(String(userId), osmId);
            return { data: null, meta: { pendingSync: true } };
          }
          return { error: result.error };
        }

        return { data: null };
      },
      async onQueryStarted(
        { id, userId, osmId },
        { dispatch, queryFulfilled },
      ) {
        const patchList = dispatch(
          placeDetailApi.util.updateQueryData(
            'getFavoritesByUser',
            {
              userId: String(userId),
            },
            draft => {
              const idx = draft.findIndex(f => f.id === id);
              if (idx !== -1) draft.splice(idx, 1);
            },
          ),
        );
        const patchSingle = dispatch(
          placeDetailApi.util.updateQueryData(
            'getFavoriteByUser',
            { userId: String(userId), osmId },
            () => null,
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchSingle.undo();

          clearPendingDeletedFavorite(String(userId), osmId);
        }
      },
      invalidatesTags: (_result, _err, arg, meta) => {
        if ((meta as { pendingSync?: boolean } | undefined)?.pendingSync) {
          return [];
        }
        return [
          { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
          { type: 'Favorite', id: `list-${arg.userId}` },
        ];
      },
    }),

    getCheckinsByOsmId: builder.query<Checkin[], string>({
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/checkins',
          params: { osmId, _sort: '-createdAt' },
        });
        if (result.error) return { error: result.error };
        const checkins = result.data as Checkin[];

        const userIds = [...new Set(checkins.map(c => c.userId))];
        const userMap: Record<
          string,
          { id: string; name: string; avatar: string }
        > = {};

        await Promise.allSettled(
          userIds.map(async uid => {
            const userResult = await baseQuery({
              url: `/users/${uid}`,
              skipOfflineQueue: true,
              suppressOfflineToast: true,
            });
            if (!userResult.error) {
              const user = userResult.data as {
                id: string;
                name: string;
                avatar: string;
              };
              userMap[uid] = {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              };
            }
          }),
        );

        return {
          data: checkins.map(c => ({
            ...c,
            user: userMap[c.userId] ?? undefined,
          })),
        };
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Checkin', id: osmId }],
    }),

    createCheckin: builder.mutation<Checkin, CreateCheckinPayload>({
      queryFn: async (payload, api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/checkins',
          method: 'POST',
          data: { ...payload, userId: Number(payload.userId) },
          invalidateTagsOnSync: [
            `Checkin:${payload.osmId}`,
            `Checkin:user-${payload.userId}`,
          ],
          offlineSuccessMessage: 'Đã check-in thành công!',
        });

        if (result.error) {
          if (isQueuedOfflineError(result.error)) {
            const currentUser = (api.getState() as any)?.auth?.user;
            const optimisticCheckin: OptimisticCheckin = {
              ...payload,
              id: genOfflineId(),
              userId: String(payload.userId),
              createdAt: new Date().toISOString(),
              _pendingSync: true,
              user: currentUser
                ? {
                    id: String(currentUser.id),
                    name: currentUser.name,
                    avatar: currentUser.avatar,
                  }
                : undefined,
            } as OptimisticCheckin;
            return { data: optimisticCheckin };
          }
          return { error: result.error };
        }

        return { data: result.data as Checkin };
      },
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data: newCheckin } = await queryFulfilled;
          dispatch(
            placeDetailApi.util.updateQueryData(
              'getCheckinsByOsmId',
              payload.osmId,
              draft => {
                draft.unshift(newCheckin);
              },
            ),
          );
        } catch {}
      },
      invalidatesTags: (result, _err, arg) => {
        if ((result as OptimisticCheckin | undefined)?._pendingSync) return [];
        return [
          { type: 'Checkin', id: arg.osmId },
          { type: 'Checkin', id: `user-${arg.userId}` },
        ];
      },
    }),

    getUserById: builder.query<
      { id: string; name: string; avatar: string; email?: string },
      string
    >({
      queryFn: async userId => {
        try {
          const { data } = await axiosInstance.get(`/users/${userId}`);
          return { data };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      providesTags: (_result, _err, userId) => [{ type: 'User', id: userId }],
    }),

    getReviewsByUserId: builder.query<Review[], string | number>({
      queryFn: async userId => {
        try {
          const { data: reviews } = await axiosInstance.get<Review[]>(
            '/reviews',
            { params: { userId, _sort: '-createdAt' } },
          );
          return { data: reviews };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${String(queryArgs)})`,
      providesTags: (_result, _err, userId) => [
        { type: 'Review', id: `user-${String(userId)}` },
      ],
    }),

    getCheckinsByUserId: builder.query<Checkin[], string | number>({
      queryFn: async userId => {
        try {
          const { data: checkins } = await axiosInstance.get<Checkin[]>(
            '/checkins',
            { params: { userId, _sort: '-createdAt' } },
          );
          return { data: checkins };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      serializeQueryArgs: ({ queryArgs, endpointName }) =>
        `${endpointName}(${String(queryArgs)})`,
      providesTags: (_result, _err, userId) => [
        { type: 'Checkin', id: `user-${String(userId)}` },
      ],
    }),
  }),
});

export const {
  useGetPlaceByOsmIdQuery,
  useUpsertPlaceMutation,
  useGetReviewsByOsmIdQuery,
  useCreateReviewMutation,
  useGetFavoriteByUserQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCheckinsByOsmIdQuery,
  useCreateCheckinMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetFavoritesByUserQuery,
  useGetPlacesByOsmIdsQuery,
  useGetUserByIdQuery,
  useGetReviewsByUserIdQuery,
  useGetCheckinsByUserIdQuery,
} = placeDetailApi;
