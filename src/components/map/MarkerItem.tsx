import { FC, memo, useEffect, useState } from 'react';
import { Marker } from 'react-native-maps';
import { AmenityMarker } from './AmenityMarker';
import { OsmMarker } from '@/types/mapScreen.type';

interface MarkerItemProps {
  item: OsmMarker;
  selected?: boolean;
  onPress: (item: OsmMarker) => void;
}

const MarkerItemComponent: FC<MarkerItemProps> = props => {
  const { item, selected, onPress } = props;
  const [track, setTrack] = useState(true);

  useEffect(() => {
    setTrack(true);
    const timer = setTimeout(() => setTrack(false), 500);
    return () => clearTimeout(timer);
  }, [selected]);

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
        onLoadEnd={() => {
          setTrack(true);
          setTimeout(() => setTrack(false), 500);
        }}
      />
    </Marker>
  );
};

export const MarkerItem = memo(MarkerItemComponent);
