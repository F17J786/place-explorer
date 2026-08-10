import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import type { Checkin } from '@/types/placeDetail.types';
import { Avatar } from '../placedetail/Avatar';
import { formatRelativeTime } from '@/utils/dateFormat';
import { useCheckinListScreenStyles } from '@/hooks/useCheckinListScreenStyles';

interface CheckinItemProps {
  item: Checkin;
}

export const CheckinItem = ({ item }: CheckinItemProps) => {
  const { t } = useTranslation('checkin');
  const { styles, colors } = useCheckinListScreenStyles();

  return (
    <View style={styles.card}>
      <Avatar uri={item.user?.avatar} size={44} />
      <View style={styles.cardContent}>
        <Text style={styles.userName}>
          {item.user?.name ?? t('common:anonymousUser')}
        </Text>
        <View style={styles.metaRow}>
          <Icon name="access-time" size={12} color={colors.textLight} />
          <Text style={styles.metaText}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="location-on" size={12} color={colors.primary} />
          <Text style={styles.distanceText}>
            {t('distanceAway', { distance: item.distanceMeters })}
          </Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Icon2 name="map-marker-check" size={18} color={colors.success} />
      </View>
    </View>
  );
};
