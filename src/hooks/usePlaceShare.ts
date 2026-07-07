import { useCallback } from 'react';
import { Share } from 'react-native';
import type { OsmMarker } from '@/types/mapScreen.type';
import { SHARE_BASE_URL } from '@/constants/constants';

export const usePlaceShare = (
  place: OsmMarker,
  osmId: string,
  amenityLabel: string,
) => {
  const handleShare = useCallback(async () => {
    const params = new URLSearchParams({
      osmType: (place as any).osmType ?? 'node',
      name: place.name ?? '',
      amenity: amenityLabel ?? '',
      lat: String(place.coordinate.latitude),
      lng: String(place.coordinate.longitude),
      address: place.address ?? '',
      thumbnailUrl: place.photoUrl ?? '',
    });

    const url = `${SHARE_BASE_URL}/${osmId}?${params.toString()}`;

    try {
      await Share.share({
        message: `${place.name} - ${url}`,
        url,
        title: place.name,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  }, [place, osmId, amenityLabel]);

  return { handleShare };
};
