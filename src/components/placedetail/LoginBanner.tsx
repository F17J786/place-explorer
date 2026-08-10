import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

export const LoginBanner = () => {
  const { styles, colors } = usePlaceDetailScreenStyles();

  return (
    <View style={styles.loginBanner}>
      <Icon name="info-outline" size={14} color={colors.primary} />
      <Text style={styles.loginBannerText}>
        Đăng nhập để check-in và đánh giá
      </Text>
    </View>
  );
};
