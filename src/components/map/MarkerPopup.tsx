import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { COLORS, getConfig } from '@/constants/constants';
import { OsmMarker } from '@/types/mapScreen.type';
import { useMapScreenStyles } from '@/hooks/useMapScreenStyles';

interface MarkerPopupProps {
  selectedMarker: OsmMarker | null;
  popupAnim: Animated.Value;
  onClose: () => void;
  onDetail: () => void;
  onRoute: () => void;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({
  selectedMarker,
  popupAnim,
  onClose,
  onDetail,
  onRoute,
}) => {
  const { styles } = useMapScreenStyles();
  const { t } = useTranslation('map');

  return (
    <Animated.View
      style={[
        styles.markerPopup,
        {
          opacity: popupAnim,
          transform: [
            {
              translateY: popupAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          pointerEvents: selectedMarker ? 'auto' : 'none',
        },
      ]}
    >
      {selectedMarker && (
        <>
          <View style={styles.popupRow}>
            <View
              style={[
                styles.popupIcon,
                {
                  backgroundColor:
                    getConfig(selectedMarker.amenity).color + '22',
                },
              ]}
            >
              <Icon
                name={getConfig(selectedMarker.amenity).icon}
                size={20}
                color={getConfig(selectedMarker.amenity).color}
              />
            </View>
            <View style={styles.popupInfo}>
              <Text style={styles.popupName} numberOfLines={1}>
                {selectedMarker.name}
              </Text>
              <Text style={styles.popupAmenity}>
                {selectedMarker.amenity}
                {selectedMarker.address ? ` · ${selectedMarker.address}` : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.popupClose} onPress={onClose}>
              <Icon name="close" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.popupActions}>
            <TouchableOpacity style={styles.popupDetailBtn} onPress={onDetail}>
              <Icon name="info" size={14} color={COLORS.white} />
              <Text style={styles.popupDetailText}>{t('popup.detail')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupRouteBtn} onPress={onRoute}>
              <Icon name="directions" size={14} color={COLORS.primary} />
              <Text style={styles.popupRouteBtnText}>
                {t('placeDetail:actions.directions')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};
