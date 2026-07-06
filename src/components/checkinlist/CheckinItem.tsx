import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar } from '@/components/reviewlist/Avatar';
import { COLORS } from '@/constants/constantsCheckinListScreen';
import { styles } from '@/constants/stylesCheckinListScreen';
import type { Checkin } from '@/types/placeDetail.types';

interface CheckinItemProps {
  item: Checkin;
}

export const CheckinItem = ({ item }: CheckinItemProps) => (
  <View style={styles.card}>
    <Avatar uri={item.user?.avatar} size={44} />
    <View style={styles.cardContent}>
      <Text style={styles.userName}>
        {item.user?.name ?? 'Người dùng ẩn danh'}
      </Text>
      <View style={styles.metaRow}>
        <Icon name="access-time" size={12} color={COLORS.textLight} />
        <Text style={styles.metaText}>
          {new Date(item.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name="location-on" size={12} color={COLORS.primary} />
        <Text style={styles.distanceText}>Cách {item.distanceMeters}m</Text>
      </View>
    </View>
    <View style={styles.badge}>
      <Icon2 name="map-marker-check" size={18} color={COLORS.success} />
    </View>
  </View>
);
