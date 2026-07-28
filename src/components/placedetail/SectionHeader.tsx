import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
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
}: SectionHeaderProps) => {
  const { t } = useTranslation('placeDetail');

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
        {count !== undefined && (
          <Text style={styles.sectionCount}> ({count})</Text>
        )}
      </Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={styles.hitSlop2}>
          <Text style={styles.seeAll}>{t('common:seeAll')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
