import React, { forwardRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { COLORS, FILTER_OPTIONS } from '@/constants/constants';
import { styles } from '@/constants/stylesReviewListScreen';
import type { FilterType } from '@/types/reviewListScreen.types';
import { FilterHandleComponent } from '@/components/reviewlist/FilterHandleComponent';
import { FilterApplyButton } from '@/components/reviewlist/FilterApplyButton';

interface FilterBottomSheetProps {
  activeFilter: FilterType;
  onApply: (filter: FilterType) => void;
}

export const FilterBottomSheet = forwardRef<
  BottomSheetModal,
  FilterBottomSheetProps
>(({ activeFilter, onApply }, ref) => {
  const [temp, setTemp] = useState<FilterType>(activeFilter);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    stiffness: 700,
  });

  const handleApply = () => onApply(temp);

  const handleClear = () => setTemp('newest');

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['38%']}
      enablePanDownToClose
      enableDynamicSizing={false}
      handleComponent={() => <FilterHandleComponent title="Bộ lọc" />}
      backgroundStyle={styles.bsBackground}
      animationConfigs={animationConfigs}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
      footerComponent={() => (
        <View style={styles.bsFooter}>
          <TouchableOpacity style={styles.bsClearBtn} onPress={handleClear}>
            <Text style={styles.bsClearText}>Xóa</Text>
          </TouchableOpacity>
          <FilterApplyButton onApply={handleApply} />
        </View>
      )}
    >
      <View style={styles.bsContent}>
        <Text style={styles.bsSectionTitle}>Sắp xếp theo</Text>
        <View style={styles.bsChipRow}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={String(opt.id)}
              style={[styles.bsChip, temp === opt.id && styles.bsChipActive]}
              onPress={() => setTemp(opt.id)}
            >
              {temp === opt.id && (
                <Icon
                  name="check"
                  size={13}
                  color={COLORS.primary}
                  style={styles.bsChipIcon}
                />
              )}
              <Text
                style={[
                  styles.bsChipText,
                  temp === opt.id && styles.bsChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheetModal>
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';
