import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

export const ReviewCardSkeleton = React.memo(() => {
  const { styles } = usePlaceDetailScreenStyles();

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Shimmer width={36} height={36} borderRadius={18} />
        <View style={styles.reviewMeta}>
          <Shimmer width="45%" height={14} borderRadius={4} />
          <View style={{ height: 5 }} />
          <Shimmer width="30%" height={11} borderRadius={4} />
        </View>
      </View>

      <View style={styles.reviewRatingRow}>
        <Shimmer width={80} height={12} borderRadius={4} />
      </View>

      <View style={{ marginTop: 8, gap: 5 }}>
        <Shimmer width="100%" height={13} borderRadius={4} />
        <Shimmer width="70%" height={13} borderRadius={4} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <Shimmer width={72} height={72} borderRadius={10} />
        <Shimmer width={72} height={72} borderRadius={10} />
      </View>
    </View>
  );
});
