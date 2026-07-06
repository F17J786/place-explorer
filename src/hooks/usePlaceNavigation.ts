import { useCallback } from 'react';
import type { OsmMarker } from '@/types/mapScreen.type';
import type { Review, Checkin } from '@/types/placeDetail.types';
import type { PlaceDetailNavProp } from '@/types/navigation';

export const usePlaceNavigation = (
  navigation: PlaceDetailNavProp,
  place: OsmMarker,
) => {
  const handleSearchRoute = useCallback(() => {
    navigation.getParent()?.navigate('Main', {
      screen: 'Map',
      params: {
        screen: 'MapScreen',
        params: { routeTo: place },
      },
    });
  }, [navigation, place]);

  const handleOpenMaps = useCallback(() => {
    navigation.getParent()?.navigate('Main', {
      screen: 'Map',
      params: {
        screen: 'MapScreen',
        params: { selectedMarker: place, navKey: Date.now() },
      },
    });
  }, [navigation, place]);

  const goToProfileReview = useCallback(
    (review: Review) => {
      navigation.navigate('ProfileReview', {
        userId: String(review.userId),
        name: review.user?.name,
        avatar: review.user?.avatar,
      });
    },
    [navigation],
  );

  const goToProfileCheckin = useCallback(
    (checkin: Checkin) => {
      navigation.navigate('ProfileReview', {
        userId: String(checkin.userId),
        name: checkin.user?.name,
        avatar: checkin.user?.avatar,
      });
    },
    [navigation],
  );

  return {
    handleSearchRoute,
    handleOpenMaps,
    goToProfileReview,
    goToProfileCheckin,
  };
};
