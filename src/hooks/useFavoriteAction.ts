import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useUpsertPlaceMutation,
} from '@/store/api/placeDetailApi';
import type { OsmMarker } from '@/types/mapScreen.type';
import type { User } from '@/types/user';
import type { Favorite } from '@/types/placeDetail.types';

type UseFavoriteActionParams = {
  isLoggedIn: boolean;
  user: User | null | undefined;
  isFavorited: boolean;
  favorite: Favorite | null | undefined;
  osmId: string;
  place: OsmMarker;
  amenityLabel: string;
};

export const useFavoriteAction = ({
  isLoggedIn,
  user,
  isFavorited,
  favorite,
  osmId,
  place,
  amenityLabel,
}: UseFavoriteActionParams) => {
  const { t } = useTranslation('placeDetail');
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [upsertPlace] = useUpsertPlaceMutation();

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert(
        t('checkinAction.loginRequired.title'),
        t('favoriteAction.loginRequired.message'),
      );
      return;
    }

    if (isFavorited && favorite) {
      await removeFavorite({
        id: favorite.id,
        userId: String(user.id),
        osmId,
      });
      Alert.alert(
        t('favoriteAction.removed.title'),
        t('favoriteAction.removed.message'),
      );
      return;
    }

    await upsertPlace({
      osmId,
      osmType: 'node',
      name: place.name,
      category: amenityLabel,
      lat: place.coordinate.latitude,
      lng: place.coordinate.longitude,
      address: place.address ?? '',
      thumbnailUrl: place.photoUrl ?? '',
    });

    await addFavorite({
      userId: String(user.id),
      osmId,
      createdAt: new Date().toISOString(),
    });

    Alert.alert(
      t('favoriteAction.added.title'),
      t('favoriteAction.added.message'),
    );
  }, [
    isLoggedIn,
    user,
    isFavorited,
    favorite,
    osmId,
    place,
    amenityLabel,
    addFavorite,
    removeFavorite,
    upsertPlace,
    t,
  ]);

  return { handleToggleFavorite };
};
