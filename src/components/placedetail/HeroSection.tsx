import React from 'react';
import { View, Image } from 'react-native';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type HeroSectionProps = {
  photoUrl?: string;
  seedId: string | number;
};

export const HeroSection = ({ photoUrl, seedId }: HeroSectionProps) => {
  const { styles } = usePlaceDetailScreenStyles();

  return (
    <View style={styles.heroContainer}>
      <Image
        source={{
          uri: photoUrl ?? `https://picsum.photos/seed/${seedId}/800/400`,
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />
    </View>
  );
};
