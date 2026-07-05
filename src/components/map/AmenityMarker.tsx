import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, getConfig } from '@/constants/constantsMapScreen';

interface AmenityMarkerProps {
  amenity: string;
  photoUrl?: string;
  onLoadEnd?: () => void;
  selected?: boolean;
}

export const AmenityMarker = React.memo(
  ({ amenity, photoUrl, onLoadEnd, selected }: AmenityMarkerProps) => {
    const { icon, color } = getConfig(amenity);
    return (
      <View style={markerStyles.wrapper}>
        <View
          style={[
            markerStyles.bubble,
            { backgroundColor: selected ? COLORS.primary : color },
            selected && markerStyles.bubbleSelected,
          ]}
        >
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={markerStyles.img}
              onLoadEnd={onLoadEnd}
            />
          ) : (
            <Icon name={icon} size={16} color="#fff" />
          )}
        </View>
        <View
          style={[
            markerStyles.arrow,
            { borderTopColor: selected ? COLORS.primary : color },
          ]}
        />
      </View>
    );
  },
);

export const markerStyles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  bubbleSelected: {
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    transform: [{ scale: 1.15 }],
  },
  img: { width: 36, height: 36, borderRadius: 18 },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
