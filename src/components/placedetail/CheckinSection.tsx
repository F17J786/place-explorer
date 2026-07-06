import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/constantsPlaceDetailScreen';
import { styles } from '@/constants/stylesPlaceDetailScreen';
import { SectionHeader } from '@/components/placedetail/SectionHeader';
import { Avatar } from '@/components/placedetail/Avatar';
import type { Checkin } from '@/types/placeDetail.types';

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
}: CheckinSectionProps) => (
  <View style={styles.section}>
    <SectionHeader
      title="Check-in"
      count={checkins.length}
      onSeeAll={onSeeAll}
    />

    {checkinsLoading ? (
      <ActivityIndicator color={COLORS.primary} style={styles.checkinLoading} />
    ) : previewCheckins.length === 0 ? (
      <View style={styles.emptyState}>
        <Icon2
          name="map-marker-off-outline"
          size={36}
          color={COLORS.textLight}
        />
        <Text style={styles.emptyText}>Chưa có check-in nào</Text>
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
              {checkin.user?.name ?? 'Người dùng'}
            </Text>
            <Text style={styles.checkinMeta}>
              {new Date(checkin.createdAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {'  •  '}
              {checkin.distanceMeters}m
            </Text>
          </TouchableOpacity>
          <View style={styles.checkinBadge}>
            <Icon2 name="map-marker-check" size={14} color={COLORS.success} />
          </View>
        </View>
      ))
    )}
  </View>
);
