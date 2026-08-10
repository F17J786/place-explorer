import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useFavoritesScreenStyles } from '@/hooks/useFavoritesScreenStyles';

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
  const { styles, colors } = useFavoritesScreenStyles();
  const { t } = useTranslation('favorites');

  if (isSelectMode) {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onCancelSelect}>
          <Icon name="close" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {selectedCount > 0
              ? t('header.selectedCount', { count: selectedCount })
              : t('header.selectPrompt')}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerTextBtn}
              onPress={onToggleAll}
            >
              <Text style={styles.headerTextBtnLabel}>
                {isAllSelected
                  ? t('header.deselectAll')
                  : t('header.selectAll')}
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
                {t('common:button.delete')}
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
        <Text style={styles.headerTitle}>{t('header.title')}</Text>
        {hasFavorites && (
          <TouchableOpacity
            style={styles.headerTextBtn}
            onPress={onEnterSelectMode}
          >
            <Text style={styles.headerTextBtnLabel}>
              {t('common:button.delete')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
