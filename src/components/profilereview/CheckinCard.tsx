import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import type { Checkin } from '@/types/placeDetail.types';
import { formatRelativeTime } from '@/utils/dateFormat';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';

export const CheckinCard = ({
  item,
  placeName,
  placeAddress,
  onOpenPlace,
}: {
  item: Checkin;
  placeName: string;
  placeAddress?: string;
  onOpenPlace: () => void;
}) => {
  const { styles, colors } = useProfileReviewScreenStyles();
  const { t } = useTranslation('profileReview');

  const distanceText =
    item.distanceMeters < 1000
      ? t('distanceMeters', { value: Math.round(item.distanceMeters) })
      : t('distanceKm', { value: (item.distanceMeters / 1000).toFixed(1) });

  return (
    <TouchableOpacity
      style={styles.checkinCard}
      onPress={onOpenPlace}
      activeOpacity={0.7}
    >
      <View style={styles.placeIconWrap}>
        <Icon name="check-circle" size={16} color={colors.primary} />
      </View>
      <View style={styles.checkinInfo}>
        <Text style={styles.placeName} numberOfLines={1}>
          {placeName}
        </Text>
        {!!placeAddress && (
          <Text style={styles.placeAddress} numberOfLines={1}>
            {placeAddress}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>
            {formatRelativeTime(item.createdAt)}
          </Text>
          <Text style={styles.dateText}>•</Text>
          <Text style={styles.dateText}>{distanceText}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
};
