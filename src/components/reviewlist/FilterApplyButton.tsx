import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import { styles } from '@/constants/stylesReviewListScreen';

interface FilterApplyButtonProps {
  onApply: () => void;
}

export const FilterApplyButton = ({ onApply }: FilterApplyButtonProps) => {
  const { close } = useBottomSheet();
  return (
    <TouchableOpacity
      style={styles.bsApplyBtn}
      onPress={() => {
        onApply();
        close();
      }}
    >
      <Text style={styles.bsApplyText}>Áp dụng</Text>
    </TouchableOpacity>
  );
};
