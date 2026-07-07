import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, getConfig } from '@/constants/constants';
import { OsmMarker } from '@/types/mapScreen.type';

interface MarkerRowProps {
  item: OsmMarker;
}

export const MarkerRow = React.memo(({ item }: MarkerRowProps) => {
  const { icon, color } = getConfig(item.amenity);
  return (
    <View style={styles.rowItem}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.rowAmenity}>{item.amenity}</Text>
        <View style={styles.coordRow}>
          <Icon name="place" size={11} color={COLORS.primary} />
          <Text style={styles.coordText}>
            {item.coordinate.latitude.toFixed(4)},
            {item.coordinate.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  rowAmenity: {
    fontSize: 11,
    color: COLORS.textSec,
    marginTop: 1,
    textTransform: 'capitalize',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 2,
  },
  coordText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  rowInfo: {
    flex: 1,
  },
});
