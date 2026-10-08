import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

export const CheckinRowSkeleton = React.memo(() => {
  const { styles } = usePlaceDetailScreenStyles();

  return (
    <View style={styles.checkinRow}>
      <Shimmer width={32} height={32} borderRadius={16} />
      <View style={styles.checkinInfo}>
        <Shimmer width="40%" height={13} borderRadius={4} />
        <View style={{ height: 5 }} />
        <Shimmer width="55%" height={11} borderRadius={4} />
      </View>
    </View>
  );
});
