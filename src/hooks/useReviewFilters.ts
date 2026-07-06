import { useMemo, useState } from 'react';
import type { Review } from '@/types/placeDetail.types';
import type { FilterType } from '@/types/reviewListScreen.types';

export const useReviewFilters = (reviews: Review[]) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('newest');

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (activeFilter === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      result = result.filter(r => r.rating === activeFilter);
    }
    return result;
  }, [reviews, activeFilter]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const ratingDist = useMemo(
    () =>
      [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: reviews.length
          ? (reviews.filter(r => r.rating === star).length /
              reviews.length) *
            100
          : 0,
      })),
    [reviews],
  );

  return {
    activeFilter,
    setActiveFilter,
    filteredReviews,
    avgRating,
    ratingDist,
  };
};
