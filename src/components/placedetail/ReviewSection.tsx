import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesPlaceDetailScreen';
import { SectionHeader } from '@/components/placedetail/SectionHeader';
import { StarRow } from '@/components/placedetail/StarRow';
import { Avatar } from '@/components/placedetail/Avatar';
import MediaThumb from '@/components/review/MediaThumb';
import type { Review } from '@/types/placeDetail.types';
import type { LightboxState } from '@/types/PlaceDetail.types';
import { formatDate } from '@/utils/dateFormat';

type ReviewSectionProps = {
  reviews: Review[];
  previewReviews: Review[];
  reviewsLoading: boolean;
  onSeeAll: () => void;
  onGoToProfile: (review: Review) => void;
  onOpenLightbox: (state: LightboxState) => void;
};

export const ReviewSection = ({
  reviews,
  previewReviews,
  reviewsLoading,
  onSeeAll,
  onGoToProfile,
  onOpenLightbox,
}: ReviewSectionProps) => {
  const { t } = useTranslation('placeDetail');

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('reviewSection.title')}
        count={reviews.length}
        onSeeAll={onSeeAll}
      />

      <View style={styles.reviewList}>
        {reviewsLoading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={styles.reviewLoading}
          />
        ) : previewReviews.length === 0 ? (
          <TouchableOpacity style={styles.emptyState} onPress={onSeeAll}>
            <Icon2
              name="comment-text-outline"
              size={36}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>{t('reviewSection.empty')}</Text>
            <Text style={styles.emptyHint}>{t('reviewSection.emptyHint')}</Text>
          </TouchableOpacity>
        ) : (
          previewReviews.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <TouchableOpacity
                  onPress={() => onGoToProfile(review)}
                  hitSlop={styles.hitSlop}
                >
                  <Avatar uri={review.user?.avatar} size={36} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reviewMeta}
                  onPress={() => onGoToProfile(review)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.reviewAuthor}>
                    {review.user?.name ?? t('common:anonymousUser')}
                  </Text>
                  <View style={styles.reviewRatingRow}>
                    <StarRow rating={review.rating} size={12} />
                    <Text style={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {review.mediaUrls.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={review.mediaUrls}
                  keyExtractor={(_, i) => `${review.id}-${i}`}
                  contentContainerStyle={styles.reviewMediaContent}
                  renderItem={({ item: url, index }) => (
                    <MediaThumb
                      url={url}
                      type={review.mediaTypes?.[index] ?? 'image'}
                      onPress={() =>
                        onOpenLightbox({
                          urls: review.mediaUrls,
                          types:
                            review.mediaTypes ??
                            review.mediaUrls.map(() => 'image' as const),
                          index,
                        })
                      }
                    />
                  )}
                />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
};
