import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetReviewsByOsmIdQuery,
  useGetFavoriteByUserQuery,
  useGetCheckinsByOsmIdQuery,
} from '@/store/api/placeDetailApi';

export const usePlaceDetailData = (osmId: string) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;

  const { data: reviews = [], isLoading: reviewsLoading } =
    useGetReviewsByOsmIdQuery(osmId);

  const { data: checkins = [], isLoading: checkinsLoading } =
    useGetCheckinsByOsmIdQuery(osmId);

  const { data: favorite } = useGetFavoriteByUserQuery(
    { userId: user?.id ?? '', osmId },
    { skip: !isLoggedIn },
  );

  const isFavorited = !!favorite;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const allMedia = reviews.flatMap(r =>
    r.mediaUrls.map((url, i) => ({
      url,
      type: (r.mediaTypes?.[i] ?? 'image') as 'image' | 'video',
      id: `${r.id}-${i}`,
    })),
  );

  return {
    user,
    isLoggedIn,
    reviews,
    reviewsLoading,
    checkins,
    checkinsLoading,
    favorite,
    isFavorited,
    avgRating,
    allMedia,
  };
};
