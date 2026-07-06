import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/constants/stylesPlaceDetailScreen';

type SectionHeaderProps = {
  title: string;
  count?: number;
  onSeeAll?: () => void;
};

export const SectionHeader = ({
  title,
  count,
  onSeeAll,
}: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {title}
      {count !== undefined && (
        <Text style={styles.sectionCount}> ({count})</Text>
      )}
    </Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} hitSlop={styles.hitSlop2}>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);
