import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { styles } from '@/constants/stylesReviewListScreen';

interface FilterApplyButtonProps {
  onApply: () => void;
}

export const FilterApplyButton = ({ onApply }: FilterApplyButtonProps) => {
  const { t } = useTranslation('review');
  const { close } = useBottomSheet();
  return (
    <TouchableOpacity
      style={styles.bsApplyBtn}
      onPress={() => {
        onApply();
        close();
      }}
    >
      <Text style={styles.bsApplyText}>{t('filter.apply')}</Text>
    </TouchableOpacity>
  );
};
