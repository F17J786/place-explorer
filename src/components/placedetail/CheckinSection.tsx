import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/placedetail/SectionHeader';
import { Avatar } from '@/components/placedetail/Avatar';
import type { Checkin } from '@/types/placeDetail.types';
import { formatRelativeTime } from '@/utils/dateFormat';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type CheckinSectionProps = {
  checkins: Checkin[];
  previewCheckins: Checkin[];
  checkinsLoading: boolean;
  onSeeAll: () => void;
  onGoToProfile: (checkin: Checkin) => void;
};

export const CheckinSection = ({
  checkins,
  previewCheckins,
  checkinsLoading,
  onSeeAll,
  onGoToProfile,
}: CheckinSectionProps) => {
  const { styles, colors } = usePlaceDetailScreenStyles();
  const { t } = useTranslation('placeDetail');

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('checkinSection.title')}
        count={checkins.length}
        onSeeAll={onSeeAll}
      />

      {checkinsLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.checkinLoading}
        />
      ) : previewCheckins.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon2
            name="map-marker-off-outline"
            size={36}
            color={colors.textLight}
          />
          <Text style={styles.emptyText}>{t('checkinSection.empty')}</Text>
        </View>
      ) : (
        previewCheckins.map(checkin => (
          <View key={checkin.id} style={styles.checkinRow}>
            <TouchableOpacity
              onPress={() => onGoToProfile(checkin)}
              hitSlop={styles.hitSlop}
            >
              <Avatar uri={checkin.user?.avatar} size={32} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkinInfo}
              onPress={() => onGoToProfile(checkin)}
              activeOpacity={0.6}
            >
              <Text style={styles.checkinName}>
                {checkin.user?.name ?? t('common:anonymousUser')}
              </Text>
              <Text style={styles.checkinMeta}>
                {formatRelativeTime(checkin.createdAt)}
                {'  •  '}
                {checkin.distanceMeters}m
              </Text>
            </TouchableOpacity>
            <View style={styles.checkinBadge}>
              <Icon2 name="map-marker-check" size={14} color={colors.success} />
            </View>
          </View>
        ))
      )}
    </View>
  );
};
