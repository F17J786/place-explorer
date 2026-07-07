import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesPlaceDetailScreen';

export const LoginBanner = () => (
  <View style={styles.loginBanner}>
    <Icon name="info-outline" size={14} color={COLORS.primary} />
    <Text style={styles.loginBannerText}>
      Đăng nhập để check-in và đánh giá
    </Text>
  </View>
);
