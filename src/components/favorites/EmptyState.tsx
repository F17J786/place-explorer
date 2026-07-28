import React from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { styles } from '@/constants/stylesFavoritesScreen';

export const EmptyState = () => {
  const { t } = useTranslation('favorites');

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Icon name="bookmark-off-outline" size={52} color="#1A56DB33" />
      </View>
      <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
      <Text style={styles.emptySubtitle}>{t('empty.subtitle')}</Text>
    </View>
  );
};
