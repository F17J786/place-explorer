import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Checkin } from '@/types/placeDetail.types';
import { COLORS } from '@/constants/constantsProfileReviewScreen';
import { styles } from '@/constants/stylesProfileReviewScreen';

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
}) => (
  <TouchableOpacity
    style={styles.checkinCard}
    onPress={onOpenPlace}
    activeOpacity={0.7}
  >
    <View style={styles.placeIconWrap}>
      <Icon name="check-circle" size={16} color={COLORS.primary} />
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
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.dateText}>•</Text>
        <Text style={styles.dateText}>
          {item.distanceMeters < 1000
            ? `${Math.round(item.distanceMeters)}m`
            : `${(item.distanceMeters / 1000).toFixed(1)}km`}
        </Text>
      </View>
    </View>
    <Icon name="chevron-right" size={20} color={COLORS.textLight} />
  </TouchableOpacity>
);
