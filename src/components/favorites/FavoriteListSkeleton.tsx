import React from 'react';
import { View } from 'react-native';

import { FavoriteCardSkeleton } from '@/components/favorites/FavoriteCardSkeleton';
import { useFavoritesScreenStyles } from '@/hooks/useFavoritesScreenStyles';

const SKELETON_COUNT = 6;

export const FavoriteListSkeleton = () => {
  const { styles } = useFavoritesScreenStyles();

  return (
    <View style={[styles.listContent, { gap: styles.separator.height }]}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <FavoriteCardSkeleton key={index} />
      ))}
    </View>
  );
};
