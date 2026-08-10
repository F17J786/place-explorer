import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import type { OsmMarker } from '@/types/mapScreen.type';
import { StarRow } from '@/components/placedetail/StarRow';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type InfoCardProps = {
  place: OsmMarker;
  amenityLabel: string;
  avgRating: string | null;
  reviewCount: number;
  onShare: () => void;
  onOpenMaps: () => void;
};

export const InfoCard = ({
  place,
  amenityLabel,
  avgRating,
  reviewCount,
  onShare,
  onOpenMaps,
}: InfoCardProps) => {
  const { styles, colors } = usePlaceDetailScreenStyles();
  const { t } = useTranslation('placeDetail');

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardTopRow}>
        <Text
          style={[styles.placeName, styles.placeNameFlex]}
          numberOfLines={2}
        >
          {place.name}
        </Text>
        <TouchableOpacity onPress={onShare}>
          <Icon name="share" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroTag}>
        <Icon2 name="map-marker" size={12} color={colors.white} />
        <Text style={styles.heroTagText}>{amenityLabel}</Text>
      </View>

      {avgRating && (
        <View style={styles.ratingRow}>
          <StarRow rating={Math.round(Number(avgRating))} size={16} />
          <Text style={styles.ratingValue}>{avgRating}</Text>
          <Text style={styles.ratingCount}>
            {t('infoCard.reviewCount', { count: reviewCount })}
          </Text>
        </View>
      )}

      {place.address && (
        <TouchableOpacity style={styles.addressRow} onPress={onOpenMaps}>
          <Icon name="location-on" size={16} color={colors.primary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {place.address}
          </Text>
          <Icon name="open-in-new" size={14} color={colors.textLight} />
        </TouchableOpacity>
      )}

      {place.tags && (
        <View style={styles.tagList}>
          {place.tags.opening_hours && (
            <View style={styles.tagChip}>
              <Icon name="access-time" size={12} color={colors.primary} />
              <Text style={styles.tagChipText}>{place.tags.opening_hours}</Text>
            </View>
          )}
          {place.tags.phone && (
            <TouchableOpacity
              style={styles.tagChip}
              onPress={() => Linking.openURL(`tel:${place.tags!.phone}`)}
            >
              <Icon name="phone" size={12} color={colors.primary} />
              <Text style={styles.tagChipText}>{place.tags.phone}</Text>
            </TouchableOpacity>
          )}
          {place.tags.website && (
            <TouchableOpacity
              style={styles.tagChip}
              onPress={() => Linking.openURL(place.tags!.website!)}
            >
              <Icon name="language" size={12} color={colors.primary} />
              <Text style={styles.tagChipText}>{t('infoCard.website')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
