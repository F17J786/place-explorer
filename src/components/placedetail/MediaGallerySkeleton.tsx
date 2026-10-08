import React from 'react';
import { View } from 'react-native';

import { Shimmer } from '@/components/common/Shimmer';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

const THUMB_COUNT = 5;

export const MediaGallerySkeleton = React.memo(() => {
  const { styles } = usePlaceDetailScreenStyles();

  return (
    <View
      style={[styles.mediaGalleryContent, { flexDirection: 'row', gap: 8 }]}
    >
      {Array.from({ length: THUMB_COUNT }).map((_, index) => (
        <Shimmer key={index} width={140} height={140} borderRadius={8} />
      ))}
    </View>
  );
});
