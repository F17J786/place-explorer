import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/constantsPlaceDetailScreen';
import { styles } from '@/constants/stylesPlaceDetailScreen';

type StarRowProps = {
  rating: number;
  size?: number;
};

export const StarRow = ({ rating, size = 14 }: StarRowProps) => (
  <View style={styles.row}>
    {[1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        name={i <= rating ? 'star' : 'star-border'}
        size={size}
        color={COLORS.star}
      />
    ))}
  </View>
);
