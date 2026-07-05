import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '@/constants/colors';
import { styles } from '@/constants/stylesFavoritesScreen';

type FavoritesHeaderProps = {
  isSelectMode: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  hasFavorites: boolean;
  onEnterSelectMode: () => void;
  onCancelSelect: () => void;
  onToggleAll: () => void;
  onDelete: () => void;
};

export const FavoritesHeader = ({
  isSelectMode,
  selectedCount,
  isAllSelected,
  hasFavorites,
  onEnterSelectMode,
  onCancelSelect,
  onToggleAll,
  onDelete,
}: FavoritesHeaderProps) => {
  if (isSelectMode) {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onCancelSelect}>
          <Icon name="close" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {selectedCount > 0 ? `Đã chọn ${selectedCount}` : 'Chọn địa điểm'}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerTextBtn}
              onPress={onToggleAll}
            >
              <Text style={styles.headerTextBtnLabel}>
                {isAllSelected ? 'Bỏ chọn' : 'Chọn tất cả'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerTextBtn}
              onPress={onDelete}
              disabled={selectedCount === 0}
            >
              <Text
                style={[
                  styles.headerTextBtnLabel,
                  styles.headerDangerText,
                  selectedCount === 0 && { opacity: 0.4 },
                ]}
              >
                Xoá
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        {hasFavorites && (
          <TouchableOpacity
            style={styles.headerTextBtn}
            onPress={onEnterSelectMode}
          >
            <Text style={styles.headerTextBtnLabel}>Xoá</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
