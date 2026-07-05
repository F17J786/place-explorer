import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { Favorite, PlaceRecord } from '@/types/placeDetail.types';

type UseFavoritesSelectionParams = {
  favorites: Favorite[];
  placesMap: Record<string, PlaceRecord>;
  userId?: string;
  removeFavorite: (args: { id: string; userId: string; osmId: string }) => any;
};

export const useFavoritesSelection = ({
  favorites,
  placesMap,
  userId,
  removeFavorite,
}: UseFavoritesSelectionParams) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const isAllSelected = useMemo(
    () => favorites.length > 0 && selectedIds.size === favorites.length,
    [favorites.length, selectedIds.size],
  );

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setSelectedIds(new Set());
  }, []);

  const cancelSelect = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map((f: Favorite) => f.id)));
    }
  }, [isAllSelected, favorites]);

  const handleDeleteSingle = useCallback(
    (item: Favorite) => {
      Alert.alert(
        'Xoá địa điểm',
        `Xoá "${placesMap[item.osmId]?.name ?? item.osmId}" khỏi yêu thích?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xoá',
            style: 'destructive',
            onPress: () =>
              removeFavorite({
                id: item.id,
                userId: userId ?? '',
                osmId: item.osmId,
              }),
          },
        ],
      );
    },
    [placesMap, removeFavorite, userId],
  );

  const handleDelete = useCallback(() => {
    const count = selectedIds.size;
    Alert.alert(
      'Xoá địa điểm yêu thích',
      `Bạn muốn xoá ${count} địa điểm đã chọn?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            const toDelete = favorites.filter((f: Favorite) =>
              selectedIds.has(f.id),
            );
            await Promise.all(
              toDelete.map((favorite: Favorite) =>
                removeFavorite({
                  id: favorite.id,
                  userId: userId ?? '',
                  osmId: favorite.osmId,
                }),
              ),
            );
            setSelectedIds(new Set());
            Alert.alert(
              'Đã xoá',
              `Đã xoá ${count} địa điểm khỏi danh sách yêu thích.`,
            );
          },
        },
      ],
    );
  }, [selectedIds, favorites, removeFavorite, userId]);

  return {
    selectedIds,
    isSelectMode,
    isAllSelected,
    enterSelectMode,
    cancelSelect,
    toggleSelect,
    toggleAll,
    handleDelete,
    handleDeleteSingle,
  };
};
