import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MediaThumb from '@/components/review/MediaThumb';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesProfileReviewScreen';
import type { FlatMedia } from '@/types/placeDetail.types';
import { Avatar } from '../placedetail/Avatar';

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
  return (
    <View>
      <View style={styles.profileHeader}>
        <Avatar uri={displayAvatar} size={96} />
        <Text style={styles.profileName}>{displayName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{reviewsCount}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{allMediaCount}</Text>
            <Text style={styles.statLabel}>Ảnh/Video</Text>
          </View>
        </View>
      </View>

      {allMediaCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ảnh & video đã đăng</Text>
            {allMediaCount > previewLimit && (
              <TouchableOpacity onPress={onToggleShowAllMedia}>
                <Text style={styles.sectionAction}>
                  {showAllMedia ? 'Thu gọn' : 'Xem tất cả'}
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
                      color={COLORS.white}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={[styles.section, styles.sectionExtraPadding]}>
        <Text style={styles.sectionTitle}>Tất cả đánh giá</Text>
        {reviewsEmpty && !reviewsLoading && (
          <Text style={styles.emptyInlineText}>Chưa có đánh giá nào</Text>
        )}
      </View>
    </View>
  );
};
