import React from 'react';
import { View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesPlaceDetailScreen';

type AvatarProps = {
  uri?: string;
  size?: number;
};

export const Avatar = ({ uri, size = 36 }: AvatarProps) => (
  <View
    style={[
      styles.avatarBase,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.primaryLight,
      },
    ]}
  >
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} />
    ) : (
      <Icon name="person" size={size * 0.6} color={COLORS.primary} />
    )}
  </View>
);
