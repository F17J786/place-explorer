import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesReviewListScreen';
import type { Review } from '@/types/placeDetail.types';
import type { FilterType, MediaItem } from '@/types/reviewListScreen.types';
import { SummaryCard } from '@/components/reviewlist/SummaryCard';
import { WriteReviewForm } from '@/components/reviewlist/WriteReviewForm';

interface RatingDistItem {
  star: number;
  count: number;
  pct: number;
}

interface ReviewListHeaderProps {
  reviews: Review[];
  avgRating: string | null;
  ratingDist: RatingDistItem[];
  showCreateForm: boolean;
  showEditForm: boolean;
  editingReview: Review | null;
  submitting: boolean;
  updating: boolean;
  onCreate: (rating: number, comment: string, media: MediaItem[]) => void;
  onUpdate: (rating: number, comment: string, media: MediaItem[]) => void;
  onEditCancel: () => void;
  activeFilter: FilterType;
  onOpenFilter: () => void;
  onClearFilter: () => void;
}

export const ReviewListHeader = ({
  reviews,
  avgRating,
  ratingDist,
  showCreateForm,
  showEditForm,
  editingReview,
  submitting,
  updating,
  onCreate,
  onUpdate,
  onEditCancel,
  activeFilter,
  onOpenFilter,
  onClearFilter,
}: ReviewListHeaderProps) => {
  const { t } = useTranslation('review');

  return (
    <View>
      {reviews.length > 0 && avgRating && (
        <SummaryCard
          avgRating={avgRating}
          reviewCount={reviews.length}
          ratingDist={ratingDist}
        />
      )}

      {showEditForm && editingReview && (
        <WriteReviewForm
          initialRating={editingReview.rating}
          initialComment={editingReview.comment}
          initialMedia={editingReview.mediaUrls.map((uri, i) => ({
            uri,
            type: (editingReview.mediaTypes?.[i] ?? 'image') as
              | 'image'
              | 'video',
          }))}
          submitLabel={t('writeReview.updateSubmit')}
          onSubmit={onUpdate}
          onCancel={onEditCancel}
          loading={updating}
        />
      )}

      {showCreateForm && (
        <WriteReviewForm onSubmit={onCreate} loading={submitting} />
      )}

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterBtn} onPress={onOpenFilter}>
          <View style={styles.iconWrapper}>
            <Icon name="tune" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.filterBtnText}>{t('filter.title')}</Text>
        </TouchableOpacity>
        {activeFilter !== 'newest' && (
          <TouchableOpacity
            onPress={onClearFilter}
            style={styles.filterClearChip}
          >
            <Text style={styles.filterClearChipText}>
              {t('filter.starChip', { star: activeFilter })}
            </Text>
            <Icon
              name="close"
              size={12}
              style={styles.filterClearIcon}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
