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

export const placeDetailApi = api.injectEndpoints({
  endpoints: builder => ({
    // ─── Place record (cache) ─────────────────────────────────────────────────
    getPlaceByOsmId: builder.query<PlaceRecord | null, string>({
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const result = await baseQuery({ url: '/places', params: { osmId } });
        if (result.error) return { error: result.error };
        const list = result.data as PlaceRecord[];
        return { data: list[0] ?? null };
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Place', id: osmId }],
    }),

    getPlacesByOsmIds: builder.query<PlaceRecord[], string[]>({
      queryFn: async (osmIds, _api, _extra, baseQuery) => {
        const results = await Promise.allSettled(
          osmIds.map(osmId => baseQuery({ url: '/places', params: { osmId } })),
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
        // Check existing
        const existing = await baseQuery({
          url: '/places',
          params: { osmId: payload.osmId },
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
        });
        if (created.error) return { error: created.error };
        return { data: created.data as PlaceRecord };
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Place', id: arg.osmId },
      ],
    }),

    // ─── Reviews ─────────────────────────────────────────────────────────────
    getReviewsByOsmId: builder.query<Review[], string>({
      queryFn: async osmId => {
        try {
          const { data: reviews } = await axiosInstance.get<Review[]>(
            '/reviews',
            {
              params: { osmId, _sort: '-createdAt' },
            },
          );

          const userIds = [...new Set(reviews.map(r => r.userId))];
          const userMap: Record<
            string,
            { id: string; name: string; avatar: string }
          > = {};

          await Promise.allSettled(
            userIds.map(async uid => {
              const { data: user } = await axiosInstance.get(`/users/${uid}`);
              userMap[uid] = {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              };
            }),
          );

          return {
            data: reviews.map(r => ({
              ...r,
              user: userMap[r.userId] ?? undefined,
            })),
          };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Review', id: osmId }],
    }),

    createReview: builder.mutation<Review, CreateReviewPayload>({
      queryFn: async (payload, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/reviews',
          method: 'POST',
          data: { ...payload, userId: Number(payload.userId) },
        });
        if (result.error) return { error: result.error };
        return { data: result.data as Review };
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Review', id: arg.osmId },
        { type: 'Review', id: `user-${arg.userId}` },
      ],
    }),

    updateReview: builder.mutation<Review, UpdateReviewPayload>({
      query: ({ id, ...body }) => ({
        url: `/reviews/${id}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: (result, _err, arg) => [
        { type: 'Review', id: arg.osmId },
        ...(result
          ? [{ type: 'Review' as const, id: `user-${result.userId}` }]
          : []),
      ],
    }),

    deleteReview: builder.mutation<
      void,
      { id: string; osmId: string; userId: string }
    >({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Review', id: arg.osmId },
        { type: 'Review', id: `user-${arg.userId}` },
      ],
    }),

    getFavoritesByUser: builder.query<Favorite[], string>({
      queryFn: async (userId, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/favorites',
          params: { userId: Number(userId) },
        });
        if (result.error) return { error: result.error };
        return { data: result.data as Favorite[] };
      },
      providesTags: (_result, _err, userId) => [
        { type: 'Favorite', id: `list-${userId}` },
      ],
    }),

    // ─── Favorites ───────────────────────────────────────────────────────────
    getFavoriteByUser: builder.query<
      Favorite | null,
      { userId: string; osmId: string }
    >({
      queryFn: async ({ userId, osmId }, _api, _extra, baseQuery) => {
        const result = await baseQuery({
          url: '/favorites',
          params: { userId: Number(userId), osmId },
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
      queryFn: async payload => {
        try {
          const { data: list } = await axiosInstance.get<Favorite[]>(
            '/favorites',
            {
              params: { userId: Number(payload.userId), osmId: payload.osmId },
            },
          );
          if (list.length > 0) return { data: list[0] };

          const { data } = await axiosInstance.post<Favorite>('/favorites', {
            ...payload,
            userId: Number(payload.userId),
          });
          return { data };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
        { type: 'Favorite', id: `list-${arg.userId}` },
      ],
    }),

    removeFavorite: builder.mutation<
      void,
      { id: string; userId: string; osmId: string }
    >({
      query: ({ id }) => ({
        url: `/favorites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
        { type: 'Favorite', id: `list-${arg.userId}` },
      ],
    }),

    // ─── Checkins ────────────────────────────────────────────────────────────
    getCheckinsByOsmId: builder.query<Checkin[], string>({
      queryFn: async osmId => {
        try {
          console.log('calling checkins with osmId:', osmId);

          const { data: checkins } = await axiosInstance.get<Checkin[]>(
            '/checkins',
            {
              params: { osmId, _sort: 'createdAt' },
            },
          );
          console.log('checkins raw response:', checkins);

          const userIds = [...new Set(checkins.map(c => c.userId))];
          const userMap: Record<
            string,
            { id: string; name: string; avatar: string }
          > = {};

          await Promise.allSettled(
            userIds.map(async uid => {
              const { data: user } = await axiosInstance.get(`/users/${uid}`);
              userMap[uid] = {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              };
            }),
          );

          return {
            data: checkins.map(c => ({
              ...c,
              user: userMap[c.userId] ?? undefined,
            })),
          };
        } catch (e: any) {
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      providesTags: (_result, _err, osmId) => [{ type: 'Checkin', id: osmId }],
    }),

    createCheckin: builder.mutation<Checkin, CreateCheckinPayload>({
      query: payload => ({
        url: '/checkins',
        method: 'POST',
        data: { ...payload, userId: Number(payload.userId) },
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Checkin', id: arg.osmId },
        { type: 'Checkin', id: `user-${arg.userId}` },
      ],
    }),

    // ─── Profile (reviewer) ──────────────────────────────────────────────────
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

    getReviewsByUserId: builder.query<Review[], string>({
      queryFn: async userId => {
        try {
          console.log('getReviewsByUserId called with userId:', userId);
          const { data: reviews } = await axiosInstance.get<Review[]>(
            '/reviews',
            {
              params: { userId, _sort: '-createdAt' },
            },
          );
          console.log('getReviewsByUserId raw response:', reviews);
          return { data: reviews };
        } catch (e: any) {
          console.log('getReviewsByUserId error:', e.message);
          return { error: { status: e.response?.status, data: e.message } };
        }
      },
      providesTags: (_result, _err, userId) => [
        { type: 'Review', id: `user-${userId}` },
      ],
    }),

    getCheckinsByUserId: builder.query<Checkin[], string>({
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
      providesTags: (_result, _err, userId) => [
        { type: 'Checkin', id: `user-${userId}` },
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
