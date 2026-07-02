import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  BackHandler,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useGetReviewsByUserIdQuery,
  useGetUserByIdQuery,
  useGetPlacesByOsmIdsQuery,
  useGetCheckinsByUserIdQuery,
} from '@/store/api/placeDetailApi';
import type { PlaceDetailStackParamList } from '@/types/navigation';
import type { Checkin, Review } from '@/types/placeDetail.types';
import MediaThumb, { MediaLightbox } from '@/components/review/MediaThumb';

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1447B8',
  primaryLight: '#EBF0FF',
  white: '#FFFFFF',
  bg: '#F5F6FA',
  text: '#0F172A',
  textSub: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  star: '#F59E0B',
  cardShadow: 'rgba(26,86,219,0.08)',
};

const GRID_GAP = 5;
const PREVIEW_LIMIT = 9;

type RoutePropType = RouteProp<PlaceDetailStackParamList, 'ProfileReview'>;
type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ProfileReview'
>;

interface FlatMedia {
  url: string;
  type: 'image' | 'video';
  reviewId: string;
}

// ── Small components ──────────────────────────────────────────────────────────

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Icon
        key={i}
        name={i <= rating ? 'star' : 'star-border'}
        size={size}
        color={COLORS.star}
      />
    ))}
  </View>
);

const Avatar = ({ uri, size = 96 }: { uri?: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.primaryLight,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: COLORS.white,
    }}
  >
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} />
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="person" size={size * 0.5} color={COLORS.primary} />
      </View>
    )}
  </View>
);

// ── Review card (không avatar/tên, có địa điểm) ────────────────────────────────

const ProfileReviewCard = ({
  item,
  placeName,
  placeAddress,
  onOpenPlace,
  onOpenMedia,
}: {
  item: Review;
  placeName: string;
  placeAddress?: string;
  onOpenPlace: () => void;
  onOpenMedia: (index: number) => void;
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.placeRow}
        onPress={onOpenPlace}
        activeOpacity={0.7}
      >
        <View style={styles.placeIconWrap}>
          <Icon name="place" size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName} numberOfLines={1}>
            {placeName}
          </Text>
          {!!placeAddress && (
            <Text style={styles.placeAddress} numberOfLines={1}>
              {placeAddress}
            </Text>
          )}
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <View style={styles.cardTopMeta}>
        <StarRow rating={item.rating} size={13} />
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      {!!item.comment && <Text style={styles.comment}>{item.comment}</Text>}

      {item.mediaUrls.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={item.mediaUrls}
          keyExtractor={(_, i) => `${item.id}-${i}`}
          contentContainerStyle={{ gap: 8, marginTop: 10 }}
          renderItem={({ item: url, index }) => (
            <MediaThumb
              url={url}
              type={item.mediaTypes?.[index] ?? 'image'}
              onPress={() => onOpenMedia(index)}
            />
          )}
        />
      )}
    </View>
  );
};

const CheckinCard = ({
  item,
  placeName,
  placeAddress,
  onOpenPlace,
}: {
  item: Checkin;
  placeName: string;
  placeAddress?: string;
  onOpenPlace: () => void;
}) => (
  <TouchableOpacity
    style={styles.checkinCard}
    onPress={onOpenPlace}
    activeOpacity={0.7}
  >
    <View style={styles.placeIconWrap}>
      <Icon name="check-circle" size={16} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.placeName} numberOfLines={1}>
        {placeName}
      </Text>
      {!!placeAddress && (
        <Text style={styles.placeAddress} numberOfLines={1}>
          {placeAddress}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 2,
        }}
      >
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.dateText}>•</Text>
        <Text style={styles.dateText}>
          {item.distanceMeters < 1000
            ? `${Math.round(item.distanceMeters)}m`
            : `${(item.distanceMeters / 1000).toFixed(1)}km`}
        </Text>
      </View>
    </View>
    <Icon name="chevron-right" size={20} color={COLORS.textLight} />
  </TouchableOpacity>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

export const ProfileReviewScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavProp>();
  const { userId, name: initialName, avatar: initialAvatar } = route.params;

  const [showAllMedia, setShowAllMedia] = useState(false);
  const [lightbox, setLightbox] = useState<{
    urls: string[];
    types: ('image' | 'video')[];
    index: number;
  } | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const { data: userData } = useGetUserByIdQuery(userId);
  const { data: reviews = [], isLoading } = useGetReviewsByUserIdQuery(userId);
  const { data: checkins = [], isLoading: checkinsLoading } =
    useGetCheckinsByUserIdQuery(userId);

  const displayName = userData?.name ?? initialName ?? 'Người dùng ẩn danh';
  const displayAvatar = userData?.avatar ?? initialAvatar;

  const osmIds = useMemo(
    () => [
      ...new Set([...reviews.map(r => r.osmId), ...checkins.map(c => c.osmId)]),
    ],
    [reviews, checkins],
  );

  const { data: places = [] } = useGetPlacesByOsmIdsQuery(osmIds, {
    skip: osmIds.length === 0,
  });
  const placesMap = useMemo(() => {
    const map: Record<string, (typeof places)[number]> = {};
    places.forEach(p => {
      map[p.osmId] = p;
    });
    return map;
  }, [places]);

  const allMedia: FlatMedia[] = useMemo(() => {
    const items: FlatMedia[] = [];
    reviews.forEach(r => {
      r.mediaUrls.forEach((url, i) => {
        items.push({
          url,
          type: r.mediaTypes?.[i] ?? 'image',
          reviewId: r.id,
        });
      });
    });
    return items;
  }, [reviews]);

  const visibleMedia = showAllMedia
    ? allMedia
    : allMedia.slice(0, PREVIEW_LIMIT);

  const openMediaAt = useCallback(
    (index: number) => {
      setLightbox({
        urls: allMedia.map(m => m.url),
        types: allMedia.map(m => m.type),
        index,
      });
      setLightboxVisible(true);
    },
    [allMedia],
  );

  const openReviewMedia = useCallback((review: Review, index: number) => {
    setLightbox({
      urls: review.mediaUrls,
      types: review.mediaTypes ?? review.mediaUrls.map(() => 'image'),
      index,
    });
    setLightboxVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
    setTimeout(() => setLightbox(null), 300);
  }, []);

  const openPlace = useCallback(
    (osmId: string) => {
      const place = placesMap[osmId];
      if (!place) return;
      navigation.getParent()?.navigate('Main', {
        screen: 'Map',
        params: {
          screen: 'MapScreen',
          params: {
            selectedMarker: {
              osmId: place.osmId,
              osmType: place.osmType ?? 'node',
              name: place.name,
              amenity: place.category ?? '',
              lat: place.lat,
              lng: place.lng,
              address: place.address ?? '',
              thumbnailUrl: place.thumbnailUrl ?? '',
              coordinate: {
                latitude: place.lat,
                longitude: place.lng,
              },
            },
            navKey: Date.now(),
          },
        },
      });
    },
    [navigation, placesMap],
  );

  // ── Header ────────────────────────────────────────────────────────────────

  const ListHeader = (
    <View>
      <View style={styles.profileHeader}>
        <Avatar uri={displayAvatar} size={96} />
        <Text style={styles.profileName}>{displayName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{allMedia.length}</Text>
            <Text style={styles.statLabel}>Ảnh/Video</Text>
          </View>
        </View>
      </View>

      {allMedia.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ảnh & video đã đăng</Text>
            {allMedia.length > PREVIEW_LIMIT && (
              <TouchableOpacity onPress={() => setShowAllMedia(v => !v)}>
                <Text style={styles.sectionAction}>
                  {showAllMedia ? 'Thu gọn' : 'Xem tất cả'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={visibleMedia}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(m, i) => `${m.reviewId}-${i}`}
            columnWrapperStyle={{ gap: GRID_GAP }}
            contentContainerStyle={{ gap: GRID_GAP }}
            renderItem={({ item: m, index }) => (
              <TouchableOpacity
                style={styles.gridCell}
                activeOpacity={0.85}
                onPress={() => openMediaAt(index)}
              >
                <MediaThumb
                  url={m.url}
                  type={m.type}
                  onPress={() => openMediaAt(index)}
                />
                {m.type === 'video' && (
                  <View style={styles.gridVideoOverlay}>
                    <Icon
                      name="play-circle-filled"
                      size={22}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={[styles.section, { paddingTop: 12 }]}>
        <Text style={styles.sectionTitle}>Tất cả đánh giá</Text>
        {reviews.length === 0 && !isLoading && (
          <Text style={styles.emptyInlineText}>Chưa có đánh giá nào</Text>
        )}
      </View>
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => {
          const place = placesMap[item.osmId];
          return (
            <ProfileReviewCard
              item={item}
              placeName={place?.name ?? 'Địa điểm'}
              placeAddress={place?.address}
              onOpenPlace={() => openPlace(item.osmId)}
              onOpenMedia={index => openReviewMedia(item, index)}
            />
          );
        }}
        ListFooterComponent={
          <View>
            <View style={[styles.section, { paddingTop: 12 }]}>
              <Text style={styles.sectionTitle}>Tất cả check-in</Text>
              {checkins.length === 0 && !checkinsLoading && (
                <Text style={styles.emptyInlineText}>Chưa có check-in nào</Text>
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
                      placeName={place?.name ?? 'Địa điểm'}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { paddingBottom: 24 },

  profileHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.cardShadow,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 24,
  },
  statItem: { alignItems: 'center', minWidth: 64 },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  section: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 6 },
  emptyInlineText: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  gridCell: {
    width: '32.3%',
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
    marginBottom: GRID_GAP,
  },
  gridImage: { width: '100%', height: '100%' },
  gridVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  placeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  placeAddress: { fontSize: 12, color: COLORS.textSub, marginTop: 1 },

  cardTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dateText: { fontSize: 11, color: COLORS.textLight },
  comment: { fontSize: 13, color: COLORS.textSub, lineHeight: 20 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
});
