import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';

export const CheckinCardSkeleton = React.memo(() => {
  const { styles } = useProfileReviewScreenStyles();

  return (
    <View style={styles.checkinCard}>
      <Shimmer width={28} height={28} borderRadius={8} />
      <View style={styles.checkinInfo}>
        <Shimmer width="50%" height={14} borderRadius={4} />
        <View style={{ height: 5 }} />
        <Shimmer width="70%" height={12} borderRadius={4} />
        <View style={styles.metaRow}>
          <Shimmer width={60} height={11} borderRadius={4} />
        </View>
      </View>
      <Shimmer width={20} height={20} borderRadius={4} />
    </View>
  );
});
