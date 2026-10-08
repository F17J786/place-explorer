import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';

export const ProfileReviewCardSkeleton = React.memo(() => {
  const { styles } = useProfileReviewScreenStyles();

  return (
    <View style={styles.card}>
      <View style={styles.placeRow}>
        <Shimmer width={28} height={28} borderRadius={8} />
        <View style={styles.placeInfo}>
          <Shimmer width="55%" height={14} borderRadius={4} />
          <View style={{ height: 5 }} />
          <Shimmer width="75%" height={11} borderRadius={4} />
        </View>
      </View>

      <View style={styles.cardTopMeta}>
        <Shimmer width={70} height={12} borderRadius={4} />
        <Shimmer width={50} height={11} borderRadius={4} />
      </View>

      <View style={{ gap: 5 }}>
        <Shimmer width="100%" height={13} borderRadius={4} />
        <Shimmer width="60%" height={13} borderRadius={4} />
      </View>

      <View style={[styles.mediaContent, { flexDirection: 'row' }]}>
        <Shimmer width={72} height={72} borderRadius={10} />
        <Shimmer width={72} height={72} borderRadius={10} />
      </View>
    </View>
  );
});
