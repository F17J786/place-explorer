import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlaceDetailStackParamList } from '@/types/navigation';
import type { ProfileReviewPlacesMap } from '@/types/placeDetail.types';

type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ProfileReview'
>;

export const useOpenPlace = (placesMap: ProfileReviewPlacesMap) => {
  const navigation = useNavigation<NavProp>();

  const openPlace = useCallback(
    (osmId: string) => {
      const place = placesMap[osmId];
      if (!place) return;
      navigation.getParent()?.navigate('Main', {
        screen: 'Map',
        params: {
          screen: 'MapScreen',
          params: {
            selectedMarker: {
              osmId: place.osmId,
              osmType: place.osmType ?? 'node',
              name: place.name,
              amenity: place.category ?? '',
              lat: place.lat,
              lng: place.lng,
              address: place.address ?? '',
              thumbnailUrl: place.thumbnailUrl ?? '',
              coordinate: {
                latitude: place.lat,
                longitude: place.lng,
              },
            },
            navKey: Date.now(),
          },
        },
      });
    },
    [navigation, placesMap],
  );

  return { openPlace };
};
