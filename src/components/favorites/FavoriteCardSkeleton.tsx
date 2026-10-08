import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { useFavoritesScreenStyles } from '@/hooks/useFavoritesScreenStyles';

export const FavoriteCardSkeleton = () => {
  const { styles } = useFavoritesScreenStyles();

  return (
    <View style={[styles.card, { borderColor: 'transparent' }]}>
      <Shimmer width={46} height={46} borderRadius={12} />

      <View style={styles.cardBody}>
        <Shimmer width="60%" height={15} borderRadius={4} />
        <View style={{ height: 6 }} />
        <Shimmer width="85%" height={12} borderRadius={4} />
        <View style={{ height: 6 }} />
        <Shimmer width={70} height={16} borderRadius={6} />
      </View>
    </View>
  );
};
