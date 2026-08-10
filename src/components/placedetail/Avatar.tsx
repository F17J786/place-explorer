import React from 'react';
import { View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type AvatarProps = {
  uri?: string;
  size?: number;
};

export const Avatar = ({ uri, size = 36 }: AvatarProps) => {
  const { styles, colors } = usePlaceDetailScreenStyles();

  return (
    <View
      style={[
        styles.avatarBase,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryLight,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Icon name="person" size={size * 0.6} color={colors.primary} />
      )}
    </View>
  );
};
