import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MapType } from 'react-native-maps';
import { MAX_ZOOM, MIN_ZOOM } from '@/constants/constants';
import { useMapScreenStyles } from '@/hooks/useMapScreenStyles';

interface RightActionsProps {
  currentZoom: number | null;
  mapType: MapType;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  onToggleMapType: () => void;
  onRefresh: () => void;
}

export const RightActions: React.FC<RightActionsProps> = ({
  currentZoom,
  mapType,
  onZoomIn,
  onZoomOut,
  onMyLocation,
  onToggleMapType,
  onRefresh,
}) => {
  const { styles, colors } = useMapScreenStyles();

  return (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          currentZoom != null &&
            currentZoom >= MAX_ZOOM &&
            styles.actionDisabled,
        ]}
        onPress={onZoomIn}
        disabled={currentZoom != null && currentZoom >= MAX_ZOOM}
      >
        <Icon name="add" size={22} color={colors.primaryDark} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          currentZoom != null &&
            currentZoom <= MIN_ZOOM &&
            styles.actionDisabled,
        ]}
        onPress={onZoomOut}
        disabled={currentZoom != null && currentZoom <= MIN_ZOOM}
      >
        <Icon name="remove" size={22} color={colors.primaryDark} />
      </TouchableOpacity>
      <View style={styles.dividerHorizontal}>
        <View style={styles.dividerLine} />
      </View>
      <TouchableOpacity style={styles.actionBtn} onPress={onMyLocation}>
        <Icon name="my-location" size={22} color={colors.primaryDark} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          mapType === 'satellite' && styles.actionActive,
        ]}
        onPress={onToggleMapType}
      >
        <Icon
          name="layers"
          size={22}
          color={mapType === 'satellite' ? '#fff' : colors.primaryDark}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onRefresh}>
        <Icon name="refresh" size={22} color={colors.primaryDark} />
      </TouchableOpacity>
    </View>
  );
};
