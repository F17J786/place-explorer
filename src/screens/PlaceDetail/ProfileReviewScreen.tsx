import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MediaLightbox } from '@/components/review/MediaThumb';
import type { PlaceDetailStackParamList } from '@/types/navigation';
import { PREVIEW_LIMIT, GRID_GAP } from '@/constants/constants';
import { useProfileReviewScreenStyles } from '@/hooks/useProfileReviewScreenStyles';
import { useProfileReviewData } from '@/hooks/useProfileReviewData';
import { useMediaLightbox } from '@/hooks/useMediaLightbox';
import { useOpenPlace } from '@/hooks/useOpenPlace';
import { ListHeader } from '@/components/profilereview/ListHeader';
import { ProfileReviewCard } from '@/components/profilereview/ProfileReviewCard';
import { CheckinCard } from '@/components/profilereview/CheckinCard';

type RoutePropType = RouteProp<PlaceDetailStackParamList, 'ProfileReview'>;

export const ProfileReviewScreen = () => {
  const { t } = useTranslation('profileReview');
  const route = useRoute<RoutePropType>();
  const { userId, name: initialName, avatar: initialAvatar } = route.params;
  const { styles } = useProfileReviewScreenStyles();

  const [showAllMedia, setShowAllMedia] = useState(false);

  const {
    displayName,
    displayAvatar,
    reviews,
    isLoading,
    checkins,
    checkinsLoading,
    placesMap,
    allMedia,
  } = useProfileReviewData({ userId, initialName, initialAvatar });

  const visibleMedia = showAllMedia
    ? allMedia
    : allMedia.slice(0, PREVIEW_LIMIT);

  const {
    lightbox,
    lightboxVisible,
    openMediaAt,
    openReviewMedia,
    closeLightbox,
  } = useMediaLightbox(allMedia);

  const { openPlace } = useOpenPlace(placesMap);

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ListHeader
            displayAvatar={displayAvatar}
            displayName={displayName}
            reviewsCount={reviews.length}
            allMediaCount={allMedia.length}
            visibleMedia={visibleMedia}
            showAllMedia={showAllMedia}
            onToggleShowAllMedia={() => setShowAllMedia(v => !v)}
            onOpenMediaAt={openMediaAt}
            reviewsLoading={isLoading}
            reviewsEmpty={reviews.length === 0}
            previewLimit={PREVIEW_LIMIT}
            gridGap={GRID_GAP}
          />
        }
        renderItem={({ item }) => {
          const place = placesMap[item.osmId];
          return (
            <ProfileReviewCard
              item={item}
              placeName={place?.name ?? t('common:unknownPlace')}
              placeAddress={place?.address}
              onOpenPlace={() => openPlace(item.osmId)}
              onOpenMedia={index => openReviewMedia(item, index)}
            />
          );
        }}
        ListFooterComponent={
          <View>
            <View style={[styles.section, styles.sectionExtraPadding]}>
              <Text style={styles.sectionTitle}>{t('allCheckins')}</Text>
              {checkins.length === 0 && !checkinsLoading && (
                <Text style={styles.emptyInlineText}>{t('noCheckins')}</Text>
              )}
            </View>
            {checkins.length > 0 && (
              <FlatList
                data={checkins}
                scrollEnabled={false}
                keyExtractor={c => c.id}
                renderItem={({ item }) => {
                  const place = placesMap[item.osmId];
                  return (
                    <CheckinCard
                      item={item}
                      placeName={place?.name ?? t('common:unknownPlace')}
                      placeAddress={place?.address}
                      onOpenPlace={() => openPlace(item.osmId)}
                    />
                  );
                }}
              />
            )}
          </View>
        }
      />

      {lightbox && (
        <MediaLightbox
          mediaUrls={lightbox.urls}
          mediaTypes={lightbox.types}
          initialIndex={lightbox.index}
          visible={lightboxVisible}
          onClose={closeLightbox}
        />
      )}
    </View>
  );
};
