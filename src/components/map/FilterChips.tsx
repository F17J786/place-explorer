import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { FILTERS, getConfig } from '@/constants/constants';
import { styles } from '@/constants/stylesMapScreen';

interface FilterChipsProps {
  selectedAmenity: string;
  onToggle: (key: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedAmenity,
  onToggle,
}) => {
  const { t } = useTranslation('map');

  return (
    <View style={styles.filterBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
        keyboardShouldPersistTaps="always"
      >
        {FILTERS.map(f => {
          const active = selectedAmenity === f.key;
          const color = getConfig(f.key).color;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                active && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => onToggle(f.key)}
            >
              <Icon name={f.icon} size={14} color={active ? '#fff' : color} />
              <Text style={[styles.filterText, active && { color: '#fff' }]}>
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
