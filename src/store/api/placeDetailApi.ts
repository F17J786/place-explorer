import { api } from '@/store/api/baseApi';
import type {
  Review,
  Favorite,
  Checkin,
  PlaceRecord,
  CreateReviewPayload,
  CreateCheckinPayload,
  CreateFavoritePayload,
} from '@/types/placeDetail.types';

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
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const reviewRes = await baseQuery({
          url: '/reviews',
          params: { osmId, _sort: 'createdAt', _order: 'desc' },
        });
        if (reviewRes.error) return { error: reviewRes.error };
        const reviews = reviewRes.data as Review[];

        // Enrich với user info
        const userIds = [...new Set(reviews.map(r => r.userId))];
        const userMap: Record<
          string,
          { id: string; name: string; avatar: string }
        > = {};

        await Promise.allSettled(
          userIds.map(async uid => {
            const u = await baseQuery({ url: `/users/${uid}` });
            if (!u.error && u.data) {
              const user = u.data as {
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
      query: payload => ({
        url: '/reviews',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Review', id: arg.osmId },
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
          params: { userId, osmId },
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
      query: payload => ({
        url: '/favorites',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Favorite', id: `${arg.userId}-${arg.osmId}` },
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
      ],
    }),

    // ─── Checkins ────────────────────────────────────────────────────────────
    getCheckinsByOsmId: builder.query<Checkin[], string>({
      queryFn: async (osmId, _api, _extra, baseQuery) => {
        const checkinRes = await baseQuery({
          url: '/checkins',
          params: { osmId, _sort: 'createdAt', _order: 'desc' },
        });
        if (checkinRes.error) return { error: checkinRes.error };
        const checkins = checkinRes.data as Checkin[];

        const userIds = [...new Set(checkins.map(c => c.userId))];
        const userMap: Record<
          string,
          { id: string; name: string; avatar: string }
        > = {};

        await Promise.allSettled(
          userIds.map(async uid => {
            const u = await baseQuery({ url: `/users/${uid}` });
            if (!u.error && u.data) {
              const user = u.data as {
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
      query: payload => ({
        url: '/checkins',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Checkin', id: arg.osmId },
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
} = placeDetailApi;
