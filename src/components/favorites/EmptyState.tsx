import React from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { styles } from '@/constants/stylesFavoritesScreen';

export const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <Icon name="bookmark-off-outline" size={52} color="#1A56DB33" />
    </View>
    <Text style={styles.emptyTitle}>Chưa có địa điểm yêu thích</Text>
    <Text style={styles.emptySubtitle}>
      Nhấn giữ biểu tượng tim trên bản đồ để lưu địa điểm.
    </Text>
  </View>
);
