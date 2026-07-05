import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@/constants/constantsMapScreen';

interface RouteMarkerProps {
  coordinate: { latitude: number; longitude: number };
  label: 'A' | 'B';
}

export const RouteMarker = React.memo(
  ({ coordinate, label }: RouteMarkerProps) => (
    <Marker coordinate={coordinate} tracksViewChanges={true}>
      {label === 'A' ? (
        <View style={routeMarkerStyles.dotA} />
      ) : (
        <Icon name="location-on" size={36} color={COLORS.error} />
      )}
    </Marker>
  ),
);

export const routeMarkerStyles = StyleSheet.create({
  dotA: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6B7280',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  panelDot: {
    marginTop: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  dotOuter: {
    width: 18,
    height: 18,
    borderRadius: 11,
    backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelDotBlue: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderWidth: 2,
  },
});
