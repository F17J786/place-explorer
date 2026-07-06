import { useCallback } from 'react';
import { Alert } from 'react-native';
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
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [upsertPlace] = useUpsertPlaceMutation();

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm vào yêu thích.',
      );
      return;
    }

    if (isFavorited && favorite) {
      await removeFavorite({ id: favorite.id, userId: user.id, osmId });
      Alert.alert('Đã xoá', 'Đã xoá khỏi danh sách yêu thích.');
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
      userId: user.id,
      osmId,
      createdAt: new Date().toISOString(),
    });

    Alert.alert('Đã lưu', 'Đã thêm vào danh sách yêu thích!');
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
  ]);

  return { handleToggleFavorite };
};
