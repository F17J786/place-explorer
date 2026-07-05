import React, { useState } from 'react';
import { Marker } from 'react-native-maps';
import { AmenityMarker } from './AmenityMarker';
import { OsmMarker } from '@/types/mapScreen.type';

interface MarkerItemProps {
  item: OsmMarker;
  selected?: boolean;
  onPress: (item: OsmMarker) => void;
}

export const MarkerItem = React.memo(
  ({ item, selected, onPress }: MarkerItemProps) => {
    const [track, setTrack] = useState(true);
    return (
      <Marker
        coordinate={item.coordinate}
        tracksViewChanges={track}
        onPress={() => onPress(item)}
      >
        <AmenityMarker
          amenity={item.amenity}
          photoUrl={item.photoUrl}
          selected={selected}
          onLoadEnd={() => setTimeout(() => setTrack(false), 500)}
        />
      </Marker>
    );
  },
);
