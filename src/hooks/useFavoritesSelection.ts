import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('favorites');
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
        t('deleteConfirm.singleTitle'),
        t('deleteConfirm.singleMessage', {
          name: placesMap[item.osmId]?.name ?? item.osmId,
        }),
        [
          { text: t('common:button.cancel'), style: 'cancel' },
          {
            text: t('common:button.delete'),
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
    [placesMap, removeFavorite, userId, t],
  );

  const handleDelete = useCallback(() => {
    const count = selectedIds.size;
    Alert.alert(
      t('deleteConfirm.multipleTitle'),
      t('deleteConfirm.multipleMessage', { count }),
      [
        { text: t('common:button.cancel'), style: 'cancel' },
        {
          text: t('common:button.delete'),
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
              t('deleteConfirm.doneTitle'),
              t('deleteConfirm.doneMessage', { count }),
            );
          },
        },
      ],
    );
  }, [selectedIds, favorites, removeFavorite, userId, t]);

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
