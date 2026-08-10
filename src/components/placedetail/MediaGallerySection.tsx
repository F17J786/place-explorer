import React from 'react';
import { View, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import MediaThumb from '@/components/review/MediaThumb';
import { SectionHeader } from '@/components/placedetail/SectionHeader';
import type { LightboxState } from '@/types/PlaceDetail.types';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type MediaItem = { url: string; type: 'image' | 'video'; id: string };

type MediaGallerySectionProps = {
  allMedia: MediaItem[];
  onOpenLightbox: (state: LightboxState) => void;
};

export const MediaGallerySection = ({
  allMedia,
  onOpenLightbox,
}: MediaGallerySectionProps) => {
  const { styles } = usePlaceDetailScreenStyles();
  const { t } = useTranslation('placeDetail');

  if (allMedia.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={t('mediaGallery.title')} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allMedia}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.mediaGalleryContent}
        renderItem={({ item, index }) => (
          <MediaThumb
            url={item.url}
            type={item.type}
            onPress={() =>
              onOpenLightbox({
                urls: allMedia.map(m => m.url),
                types: allMedia.map(m => m.type),
                index,
              })
            }
          />
        )}
      />
    </View>
  );
};
