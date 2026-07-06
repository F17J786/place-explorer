import { useCallback, useState } from 'react';
import type { Review } from '@/types/placeDetail.types';
import type { FlatMedia, LightboxState } from '@/types/placeDetail.types';

export const useMediaLightbox = (allMedia: FlatMedia[]) => {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const openMediaAt = useCallback(
    (index: number) => {
      setLightbox({
        urls: allMedia.map(m => m.url),
        types: allMedia.map(m => m.type),
        index,
      });
      setLightboxVisible(true);
    },
    [allMedia],
  );

  const openReviewMedia = useCallback((review: Review, index: number) => {
    setLightbox({
      urls: review.mediaUrls,
      types: review.mediaTypes ?? review.mediaUrls.map(() => 'image'),
      index,
    });
    setLightboxVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
    setTimeout(() => setLightbox(null), 300);
  }, []);

  return {
    lightbox,
    lightboxVisible,
    openMediaAt,
    openReviewMedia,
    closeLightbox,
  };
};
