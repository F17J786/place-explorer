import React, { useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { OsmMarker } from '@/types/mapScreen.type';
import type {
  PlaceDetailRouteProp,
  PlaceDetailNavProp,
} from '@/types/navigation';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';
import {
  REVIEW_PREVIEW_LIMIT,
  CHECKIN_PREVIEW_LIMIT,
} from '@/constants/constants';

import { HeroSection } from '@/components/placedetail/HeroSection';
import { InfoCard } from '@/components/placedetail/InfoCard';
import { ActionButtons } from '@/components/placedetail/ActionButtons';
import { LoginBanner } from '@/components/placedetail/LoginBanner';
import { MediaGallerySection } from '@/components/placedetail/MediaGallerySection';
import { ReviewSection } from '@/components/placedetail/ReviewSection';
import { CheckinSection } from '@/components/placedetail/CheckinSection';
import { MediaLightbox } from '@/components/review/MediaThumb';

import { usePlaceDetailData } from '@/hooks/usePlaceDetailData';
import { useFavoriteAction } from '@/hooks/useFavoriteAction';
import { useCheckinAction } from '@/hooks/useCheckinAction';
import { usePlaceShare } from '@/hooks/usePlaceShare';
import { usePlaceNavigation } from '@/hooks/usePlaceNavigation';
import type { LightboxState } from '@/types/PlaceDetail.types';

export const PlaceDetailScreen = () => {
  const { t } = useTranslation('placeDetail');
  const navigation = useNavigation<PlaceDetailNavProp>();
  const route = useRoute<PlaceDetailRouteProp>();
  const { place } = route.params as { place: OsmMarker };
  const { styles } = usePlaceDetailScreenStyles();

  const osmId: string = (place as any).osmId ?? `node_${place.id}`;
  const amenityLabel =
    place.tags?.amenity ?? place.amenity ?? t('common:unknownPlace');

  const scrollRef = useRef<ScrollView>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const {
    isLoggedIn,
    user,
    reviews,
    reviewsLoading,
    checkins,
    checkinsLoading,
    favorite,
    isFavorited,
    avgRating,
    allMedia,
  } = usePlaceDetailData(osmId);

  const previewReviews = reviews.slice(0, REVIEW_PREVIEW_LIMIT);
  const previewCheckins = checkins.slice(0, CHECKIN_PREVIEW_LIMIT);

  const { handleToggleFavorite } = useFavoriteAction({
    isLoggedIn,
    user,
    isFavorited,
    favorite,
    osmId,
    place,
    amenityLabel,
  });

  const { checkinLoading, handleCheckin } = useCheckinAction({
    isLoggedIn,
    user,
    osmId,
    place,
    amenityLabel,
  });

  const { handleShare } = usePlaceShare(place, osmId, amenityLabel);

  const {
    handleSearchRoute,
    handleOpenMaps,
    goToProfileReview,
    goToProfileCheckin,
  } = usePlaceNavigation(navigation, place);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroSection photoUrl={place.photoUrl} seedId={place.id} />

        <InfoCard
          place={place}
          amenityLabel={amenityLabel}
          avgRating={avgRating}
          reviewCount={reviews.length}
          onShare={handleShare}
          onOpenMaps={handleOpenMaps}
        />

        <ActionButtons
          isLoggedIn={isLoggedIn}
          isFavorited={isFavorited}
          checkinLoading={checkinLoading}
          onSearchRoute={handleSearchRoute}
          onCheckin={handleCheckin}
          onToggleFavorite={handleToggleFavorite}
        />

        {!isLoggedIn && <LoginBanner />}

        <MediaGallerySection allMedia={allMedia} onOpenLightbox={setLightbox} />

        {lightbox !== null && (
          <MediaLightbox
            mediaUrls={lightbox.urls}
            mediaTypes={lightbox.types}
            initialIndex={lightbox.index}
            visible
            onClose={() => setLightbox(null)}
          />
        )}

        <ReviewSection
          reviews={reviews}
          previewReviews={previewReviews}
          reviewsLoading={reviewsLoading}
          onSeeAll={() =>
            navigation.navigate('ReviewList', { osmId, placeName: place.name })
          }
          onGoToProfile={goToProfileReview}
          onOpenLightbox={setLightbox}
        />

        <CheckinSection
          checkins={checkins}
          previewCheckins={previewCheckins}
          checkinsLoading={checkinsLoading}
          onSeeAll={() =>
            navigation.navigate('CheckinList', { osmId, placeName: place.name })
          }
          onGoToProfile={goToProfileCheckin}
        />
      </ScrollView>
    </View>
  );
};
