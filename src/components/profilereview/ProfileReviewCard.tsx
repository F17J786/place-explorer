import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MediaThumb from '@/components/review/MediaThumb';
import type { Review } from '@/types/placeDetail.types';
import { StarRow } from '../placedetail/StarRow';
import { formatRelativeTime } from '@/utils/dateFormat';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';

export const ProfileReviewCard = ({
  item,
  placeName,
  placeAddress,
  onOpenPlace,
  onOpenMedia,
}: {
  item: Review;
  placeName: string;
  placeAddress?: string;
  onOpenPlace: () => void;
  onOpenMedia: (index: number) => void;
}) => {
  const { styles, colors } = useProfileReviewScreenStyles();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.placeRow}
        onPress={onOpenPlace}
        activeOpacity={0.7}
      >
        <View style={styles.placeIconWrap}>
          <Icon name="place" size={16} color={colors.primary} />
        </View>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName} numberOfLines={1}>
            {placeName}
          </Text>
          {!!placeAddress && (
            <Text style={styles.placeAddress} numberOfLines={1}>
              {placeAddress}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color={colors.textLight} />
      </TouchableOpacity>

      <View style={styles.cardTopMeta}>
        <StarRow rating={item.rating} size={13} />
        <Text style={styles.dateText}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>

      {!!item.comment && <Text style={styles.comment}>{item.comment}</Text>}

      {item.mediaUrls.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={item.mediaUrls}
          keyExtractor={(_, i) => `${item.id}-${i}`}
          contentContainerStyle={styles.mediaContent}
          renderItem={({ item: url, index }) => (
            <MediaThumb
              url={url}
              type={item.mediaTypes?.[index] ?? 'image'}
              onPress={() => onOpenMedia(index)}
            />
          )}
        />
      )}
    </View>
  );
};
