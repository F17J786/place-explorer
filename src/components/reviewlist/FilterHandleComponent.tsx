import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useBottomSheet } from '@gorhom/bottom-sheet';
import { useReviewListScreenStyles } from '@/hooks/useReviewListScreenStyles';

interface FilterHandleComponentProps {
  title: string;
}

export const FilterHandleComponent = ({
  title,
}: FilterHandleComponentProps) => {
  const { styles, colors } = useReviewListScreenStyles();
  const { close } = useBottomSheet();
  return (
    <View style={styles.bsHandle}>
      <View style={styles.bsHandleBar} />
      <View style={styles.bsHandleRow}>
        <Text style={styles.bsHandleTitle}>{title}</Text>
        <TouchableOpacity
          onPress={() => close()}
          hitSlop={styles.hitSlop}
          style={styles.bsCloseBtn}
        >
          <Icon name="close" size={20} color={colors.textSub} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
