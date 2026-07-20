import React, { useCallback, useMemo } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetFavoritesByUserQuery,
  useGetPlacesByOsmIdsQuery,
  useRemoveFavoriteMutation,
} from '@/store/api/placeDetailApi';
import { useAppSelector } from '@/store/hooks';
import type { Favorite, PlaceRecord } from '@/types/placeDetail.types';

import { FavoriteCard } from '@/components/favorites/FavoriteCard';
import { FavoritesHeader } from '@/components/favorites/FavoritesHeader';
import { EmptyState } from '@/components/favorites/EmptyState';
import { useFavoritesSelection } from '@/hooks/useFavoritesSelection';
import { styles } from '@/constants/stylesFavoritesScreen';

export const FavoritesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAppSelector(state => state.auth.user);

  const {
    data: favorites = [],
    isLoading,
    refetch,
  } = useGetFavoritesByUserQuery(
    {
      userId: user?.id ?? '',
      suppressOfflineToast: false,
    },
    {
      skip: !user?.id,
    },
  );

  const osmIds = useMemo(() => favorites.map(f => f.osmId), [favorites]);

  const { data: places = [], isFetching: isPlacesFetching } =
    useGetPlacesByOsmIdsQuery(osmIds, {
      skip: osmIds.length === 0,
    });

  const placesMap = useMemo(
    () => Object.fromEntries(places.map(p => [p.osmId, p])),
    [places],
  );

  const [removeFavorite] = useRemoveFavoriteMutation();

  const {
    selectedIds,
    isSelectMode,
    isAllSelected,
    enterSelectMode,
    cancelSelect,
    toggleSelect,
    toggleAll,
    handleDelete,
    handleDeleteSingle,
  } = useFavoritesSelection({
    favorites,
    placesMap,
    userId: user?.id,
    removeFavorite,
  });

  const handleCardPress = useCallback(
    (item: Favorite, place?: PlaceRecord) => {
      if (isSelectMode) {
        toggleSelect(item.id);
        return;
      }
      navigation.navigate('PlaceDetail', {
        screen: 'PlaceDetailHome',
        params: {
          place: {
            osmId: item.osmId,
            osmType: item.osmId.split('/')[0] ?? 'node',
            name: place?.name ?? item.osmId,
            amenity: place?.category ?? '',
            lat: place?.lat ?? 0,
            lng: place?.lng ?? 0,
            address: place?.address ?? '',
            thumbnailUrl: place?.thumbnailUrl ?? '',
            coordinate: {
              latitude: place?.lat ?? 0,
              longitude: place?.lng ?? 0,
            },
          },
        },
      });
    },
    [isSelectMode, toggleSelect, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Favorite }) => {
      const place = placesMap[item.osmId];
      return (
        <FavoriteCard
          item={item}
          place={place}
          selected={selectedIds.has(item.id)}
          isSelecting={isSelectMode}
          onPress={() => handleCardPress(item, place)}
          onDelete={() => handleDeleteSingle(item)}
        />
      );
    },
    [selectedIds, isSelectMode, handleCardPress, placesMap, handleDeleteSingle],
  );

  const keyExtractor = useCallback((item: Favorite) => String(item.id), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FavoritesHeader
        isSelectMode={isSelectMode}
        selectedCount={selectedIds.size}
        isAllSelected={isAllSelected}
        hasFavorites={favorites.length > 0}
        onEnterSelectMode={enterSelectMode}
        onCancelSelect={cancelSelect}
        onToggleAll={toggleAll}
        onDelete={handleDelete}
      />

      {isLoading || isPlacesFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A56DB" />
        </View>
      ) : (
        <FlatList
          data={favorites as Favorite[]}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            favorites.length === 0 && styles.listContentEmpty,
          ]}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState />}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};
