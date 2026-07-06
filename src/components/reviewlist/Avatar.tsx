import React from 'react';
import { View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/constantsReviewListScreen';

interface AvatarProps {
  uri?: string;
  size?: number;
}

export const Avatar = ({ uri, size = 38 }: AvatarProps) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.primaryLight,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: COLORS.border,
    }}
  >
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} />
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="person" size={size * 0.55} color={COLORS.primary} />
      </View>
    )}
  </View>
);
