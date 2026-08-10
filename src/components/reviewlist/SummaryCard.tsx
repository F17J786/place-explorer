import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { StarRow } from '../placedetail/StarRow';
import { useReviewListScreenStyles } from '@/hooks/useReviewListScreenStyles';

interface RatingDistItem {
  star: number;
  count: number;
  pct: number;
}

interface SummaryCardProps {
  avgRating: string;
  reviewCount: number;
  ratingDist: RatingDistItem[];
}

export const SummaryCard = ({
  avgRating,
  reviewCount,
  ratingDist,
}: SummaryCardProps) => {
  const { t } = useTranslation('review');
  const { styles, colors } = useReviewListScreenStyles();

  return (
    <View style={styles.summaryCard}>
      <View style={styles.scoreBlock}>
        <Text style={styles.scoreNum}>{avgRating}</Text>
        <StarRow rating={Math.round(Number(avgRating))} size={18} />
        <Text style={styles.scoreCount}>
          {t('summary.reviewCount', { count: reviewCount })}
        </Text>
      </View>
      <View style={styles.distBlock}>
        {ratingDist.map(({ star, count, pct }) => (
          <View key={star} style={styles.distRow}>
            <Text style={styles.distStar}>{star}</Text>
            <Icon name="star" size={11} color={colors.star} />
            <View style={styles.distBar}>
              <View style={[styles.distFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.distCount}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
