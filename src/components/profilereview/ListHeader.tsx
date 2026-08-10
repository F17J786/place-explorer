import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import MediaThumb from '@/components/review/MediaThumb';
import type { FlatMedia } from '@/types/placeDetail.types';
import { Avatar } from '../placedetail/Avatar';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';

interface ListHeaderProps {
  displayAvatar?: string;
  displayName: string;
  reviewsCount: number;
  allMediaCount: number;
  visibleMedia: FlatMedia[];
  showAllMedia: boolean;
  onToggleShowAllMedia: () => void;
  onOpenMediaAt: (index: number) => void;
  reviewsLoading: boolean;
  reviewsEmpty: boolean;
  previewLimit: number;
  gridGap: number;
}

export const ListHeader = ({
  displayAvatar,
  displayName,
  reviewsCount,
  allMediaCount,
  visibleMedia,
  showAllMedia,
  onToggleShowAllMedia,
  onOpenMediaAt,
  reviewsLoading,
  reviewsEmpty,
  previewLimit,
  gridGap,
}: ListHeaderProps) => {
  const { styles, colors } = useProfileReviewScreenStyles();
  const { t } = useTranslation('profileReview');

  return (
    <View>
      <View style={styles.profileHeader}>
        <Avatar uri={displayAvatar} size={96} />
        <Text style={styles.profileName}>{displayName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{reviewsCount}</Text>
            <Text style={styles.statLabel}>{t('stats.reviews')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{allMediaCount}</Text>
            <Text style={styles.statLabel}>{t('stats.media')}</Text>
          </View>
        </View>
      </View>

      {allMediaCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('mediaSection.title')}</Text>
            {allMediaCount > previewLimit && (
              <TouchableOpacity onPress={onToggleShowAllMedia}>
                <Text style={styles.sectionAction}>
                  {showAllMedia
                    ? t('mediaSection.collapse')
                    : t('common:seeAll')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={visibleMedia}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(m, i) => `${m.reviewId}-${i}`}
            columnWrapperStyle={{ gap: gridGap }}
            contentContainerStyle={{ gap: gridGap }}
            renderItem={({ item: m, index }) => (
              <TouchableOpacity
                style={styles.gridCell}
                activeOpacity={0.85}
                onPress={() => onOpenMediaAt(index)}
              >
                <MediaThumb
                  url={m.url}
                  type={m.type}
                  onPress={() => onOpenMediaAt(index)}
                />
                {m.type === 'video' && (
                  <View style={styles.gridVideoOverlay}>
                    <Icon
                      name="play-circle-filled"
                      size={22}
                      color={colors.white}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={[styles.section, styles.sectionExtraPadding]}>
        <Text style={styles.sectionTitle}>{t('allReviews')}</Text>
        {reviewsEmpty && !reviewsLoading && (
          <Text style={styles.emptyInlineText}>{t('noReviews')}</Text>
        )}
      </View>
    </View>
  );
};
