import { useMemo } from 'react';
import {
  useGetReviewsByUserIdQuery,
  useGetUserByIdQuery,
  useGetPlacesByOsmIdsQuery,
  useGetCheckinsByUserIdQuery,
} from '@/store/api/placeDetailApi';
import type {
  FlatMedia,
  ProfileReviewPlacesMap,
} from '@/types/placeDetail.types';

interface UseProfileReviewDataParams {
  userId: string;
  initialName?: string;
  initialAvatar?: string;
}

export const useProfileReviewData = ({
  userId,
  initialName,
  initialAvatar,
}: UseProfileReviewDataParams) => {
  const { data: userData } = useGetUserByIdQuery(userId);
  const { data: reviews = [], isLoading } = useGetReviewsByUserIdQuery(userId);
  const { data: checkins = [], isLoading: checkinsLoading } =
    useGetCheckinsByUserIdQuery(userId);

  const displayName = userData?.name ?? initialName ?? 'Người dùng ẩn danh';
  const displayAvatar = userData?.avatar ?? initialAvatar;

  const osmIds = useMemo(
    () => [
      ...new Set([...reviews.map(r => r.osmId), ...checkins.map(c => c.osmId)]),
    ],
    [reviews, checkins],
  );

  const { data: places = [] } = useGetPlacesByOsmIdsQuery(osmIds, {
    skip: osmIds.length === 0,
  });

  const placesMap: ProfileReviewPlacesMap = useMemo(() => {
    const map: ProfileReviewPlacesMap = {};
    places.forEach(p => {
      map[p.osmId] = p;
    });
    return map;
  }, [places]);

  const allMedia: FlatMedia[] = useMemo(() => {
    const items: FlatMedia[] = [];
    reviews.forEach(r => {
      r.mediaUrls.forEach((url, i) => {
        items.push({
          url,
          type: r.mediaTypes?.[i] ?? 'image',
          reviewId: r.id,
        });
      });
    });
    return items;
  }, [reviews]);

  return {
    displayName,
    displayAvatar,
    reviews,
    isLoading,
    checkins,
    checkinsLoading,
    placesMap,
    allMedia,
  };
};
