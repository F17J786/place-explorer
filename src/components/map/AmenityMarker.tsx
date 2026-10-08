import { FC, memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, getConfig } from '@/constants/constants';

interface AmenityMarkerProps {
  amenity: string;
  photoUrl?: string;
  onLoadEnd?: () => void;
  selected?: boolean;
}

const AmenityMarkerComponent: FC<AmenityMarkerProps> = props => {
  const { amenity, photoUrl, onLoadEnd, selected } = props;
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
            style={[markerStyles.img, selected && markerStyles.imgSelected]}
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
};

export const AmenityMarker = memo(AmenityMarkerComponent);

export const markerStyles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bubbleSelected: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  img: { width: 36, height: 36, borderRadius: 18 },
  imgSelected: { width: 42, height: 42, borderRadius: 21 },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
