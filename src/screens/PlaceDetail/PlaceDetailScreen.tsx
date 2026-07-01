import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetReviewsByOsmIdQuery,
  useGetFavoriteByUserQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCheckinsByOsmIdQuery,
  useCreateCheckinMutation,
  useUpsertPlaceMutation,
} from '@/store/api/placeDetailApi';
import { showToast, type OsmMarker } from '../Map/MapScreen'; // adjust path
import { PlaceDetailStackParamList } from '@/types/navigation';
import MediaThumb, { MediaLightbox } from '@/components/review/MediaThumb';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';

// ─── Constants ────────────────────────────────────────────────────────────────

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
  success: '#10B981',
  cardShadow: 'rgba(26,86,219,0.08)',
};

// ─── Nav types ────────────────────────────────────────────────────────────────

type PlaceDetailRouteProp = RouteProp<
  PlaceDetailStackParamList,
  'PlaceDetailHome'
>;
type PlaceDetailNavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'PlaceDetailHome'
>;

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const Avatar = ({ uri, size = 36 }: { uri?: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.primaryLight,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: COLORS.border,
    }}
  >
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} />
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="person" size={size * 0.6} color={COLORS.primary} />
      </View>
    )}
  </View>
);

const SectionHeader = ({
  title,
  count,
  onSeeAll,
}: {
  title: string;
  count?: number;
  onSeeAll?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {title}
      {count !== undefined && (
        <Text style={styles.sectionCount}> ({count})</Text>
      )}
    </Text>
    {onSeeAll && (
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const PlaceDetailScreen = () => {
  const navigation = useNavigation<PlaceDetailNavProp>();
  const route = useRoute<PlaceDetailRouteProp>();
  const { place } = route.params as { place: OsmMarker };

  const osmId: string = (place as any).osmId ?? `node_${place.id}`;
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;

  const scrollRef = useRef<ScrollView>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [lightbox, setLightbox] = useState<{
    urls: string[];
    types: ('image' | 'video')[];
    index: number;
  } | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: reviews = [], isLoading: reviewsLoading } =
    useGetReviewsByOsmIdQuery(osmId);
  const { data: checkins = [], isLoading: checkinsLoading } =
    useGetCheckinsByOsmIdQuery(osmId);
  console.log(
    'osmId query:',
    osmId,
    'checkins:',
    checkins,
    'loading:',
    checkinsLoading,
  );
  const { data: favorite } = useGetFavoriteByUserQuery(
    { userId: user?.id ?? '', osmId },
    { skip: !isLoggedIn },
  );

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [createCheckin] = useCreateCheckinMutation();
  const [upsertPlace] = useUpsertPlaceMutation();

  // ── Derived ──────────────────────────────────────────────────────────────────
  const isFavorited = !!favorite;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;
  const previewReviews = reviews.slice(0, 5);
  const previewCheckins = checkins.slice(0, 3);
  const allMedia = reviews.flatMap(r =>
    r.mediaUrls.map((url, i) => ({
      url,
      type: (r.mediaTypes?.[i] ?? 'image') as 'image' | 'video',
      id: `${r.id}-${i}`,
    })),
  );
  const amenityLabel = place.tags?.amenity ?? place.amenity ?? 'Địa điểm';

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm vào yêu thích.',
      );
      return;
    }
    if (isFavorited && favorite) {
      await removeFavorite({ id: favorite.id, userId: user.id, osmId });
      Alert.alert('Đã xoá', 'Đã xoá khỏi danh sách yêu thích.');
    } else {
      await upsertPlace({
        osmId,
        osmType: 'node',
        name: place.name,
        category: amenityLabel,
        lat: place.coordinate.latitude,
        lng: place.coordinate.longitude,
        address: place.address ?? '',
        thumbnailUrl: place.photoUrl ?? '',
      });
      await addFavorite({
        userId: user.id,
        osmId,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Đã lưu', 'Đã thêm vào danh sách yêu thích!');
    }
  }, [
    isLoggedIn,
    user,
    isFavorited,
    favorite,
    osmId,
    addFavorite,
    removeFavorite,
  ]);

  const handleCheckin = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để check-in.');
      return;
    }

    await upsertPlace({
      osmId,
      osmType: 'node',
      name: place.name,
      category: amenityLabel,
      lat: place.coordinate.latitude,
      lng: place.coordinate.longitude,
      address: place.address ?? '',
      thumbnailUrl: place.photoUrl ?? '',
    });

    setCheckinLoading(true);
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const ok =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!ok) {
        setCheckinLoading(false);
        return;
      }

      try {
        await promptForEnableLocationIfNeeded();
      } catch {
        showToast('Chưa có vị trí hiện tại. Thử lại');
        setCheckinLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        async pos => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          const R = 6371000;
          const dLat = ((userLat - place.coordinate.latitude) * Math.PI) / 180;
          const dLng = ((userLng - place.coordinate.longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((place.coordinate.latitude * Math.PI) / 180) *
              Math.cos((userLat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          if (distance > 100) {
            Alert.alert(
              'Quá xa',
              `Bạn đang cách ${Math.round(
                distance,
              )}m. Cần trong phạm vi 100m để check-in.`,
            );
            setCheckinLoading(false);
            return;
          }

          await createCheckin({
            userId: user.id,
            osmId,
            lat: userLat,
            lng: userLng,
            distanceMeters: Math.round(distance * 10) / 10,
            createdAt: new Date().toISOString(),
          });

          Alert.alert(
            'Check-in thành công!',
            `Bạn đã check-in tại ${place.name}`,
          );
          setCheckinLoading(false);
        },
        err => {
          Alert.alert(
            'Lỗi vị trí',
            'Không thể lấy vị trí. Kiểm tra quyền GPS.',
          );
          setCheckinLoading(false);
          console.warn(err);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } catch {
      setCheckinLoading(false);
    }
  }, [
    isLoggedIn,
    user,
    osmId,
    place,
    amenityLabel,
    createCheckin,
    upsertPlace,
  ]);

  const handleSearchRoute = () => {
    navigation.getParent()?.navigate('Main', {
      screen: 'Map',
      params: {
        screen: 'MapScreen',
        params: { routeTo: place },
      },
    });
  };

  const handleOpenMaps = useCallback(() => {
    navigation.getParent()?.navigate('Main', {
      screen: 'Map',
      params: {
        screen: 'MapScreen',
        params: { selectedMarker: place, navKey: Date.now() },
      },
    });
  }, [navigation, place]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri:
                place.photoUrl ??
                `https://picsum.photos/seed/${place.id}/800/400`,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={[styles.placeName, { flex: 1, marginRight: 12 }]}
              numberOfLines={2}
            >
              {place.name}
            </Text>

            <TouchableOpacity>
              <Icon name="share" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroTag}>
            <Icon2 name="map-marker" size={12} color={COLORS.white} />
            <Text style={styles.heroTagText}>{amenityLabel}</Text>
          </View>

          {avgRating && (
            <View style={styles.ratingRow}>
              <StarRow rating={Math.round(Number(avgRating))} size={16} />
              <Text style={styles.ratingValue}>{avgRating}</Text>
              <Text style={styles.ratingCount}>
                ({reviews.length} đánh giá)
              </Text>
            </View>
          )}

          {place.address && (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={handleOpenMaps}
            >
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.addressText} numberOfLines={2}>
                {place.address}
              </Text>
              <Icon name="open-in-new" size={14} color={COLORS.textLight} />
            </TouchableOpacity>
          )}

          {place.tags && (
            <View style={styles.tagList}>
              {place.tags.opening_hours && (
                <View style={styles.tagChip}>
                  <Icon name="access-time" size={12} color={COLORS.primary} />
                  <Text style={styles.tagChipText}>
                    {place.tags.opening_hours}
                  </Text>
                </View>
              )}
              {place.tags.phone && (
                <TouchableOpacity
                  style={styles.tagChip}
                  onPress={() => Linking.openURL(`tel:${place.tags!.phone}`)}
                >
                  <Icon name="phone" size={12} color={COLORS.primary} />
                  <Text style={styles.tagChipText}>{place.tags.phone}</Text>
                </TouchableOpacity>
              )}
              {place.tags.website && (
                <TouchableOpacity
                  style={styles.tagChip}
                  onPress={() => Linking.openURL(place.tags!.website!)}
                >
                  <Icon name="language" size={12} color={COLORS.primary} />
                  <Text style={styles.tagChipText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons — chỉ 2 nút */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={handleSearchRoute}
          >
            <Icon name="directions" size={18} color={COLORS.primary} />
            <Text style={styles.actionBtnOutlineText}>Chỉ đường</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnPrimary,
              (!isLoggedIn || checkinLoading) && styles.actionBtnDisabled,
            ]}
            onPress={handleCheckin}
            disabled={!isLoggedIn || checkinLoading}
          >
            {checkinLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Icon2 name="map-marker-check" size={18} color={COLORS.white} />
                <Text style={styles.actionBtnPrimaryText}>Check-in</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnOutline,
              styles.actionBtnIcon,
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {!isLoggedIn && (
          <View style={styles.loginBanner}>
            <Icon name="info-outline" size={14} color={COLORS.primary} />
            <Text style={styles.loginBannerText}>
              Đăng nhập để check-in và đánh giá
            </Text>
          </View>
        )}

        {/* Media Gallery */}
        {reviews.some(r => r.mediaUrls.length > 0) && (
          <View style={styles.section}>
            <SectionHeader title="Ảnh & Video" />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={allMedia}
              keyExtractor={item => item.id}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item, index }) => (
                <MediaThumb
                  url={item.url}
                  type={item.type}
                  onPress={() =>
                    setLightbox({
                      urls: allMedia.map(m => m.url),
                      types: allMedia.map(m => m.type),
                      index,
                    })
                  }
                />
              )}
            />
          </View>
        )}

        {lightbox !== null && (
          <MediaLightbox
            mediaUrls={lightbox.urls}
            mediaTypes={lightbox.types}
            initialIndex={lightbox.index}
            visible
            onClose={() => setLightbox(null)}
          />
        )}

        {/* Reviews — preview 5, navigate sang ReviewList để xem thêm & viết */}
        <View style={styles.section}>
          <SectionHeader
            title="Đánh giá"
            count={reviews.length}
            onSeeAll={() =>
              navigation.navigate('ReviewList', {
                osmId,
                placeName: place.name,
              })
            }
          />

          {reviewsLoading ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginVertical: 24 }}
            />
          ) : previewReviews.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() =>
                navigation.navigate('ReviewList', {
                  osmId,
                  placeName: place.name,
                })
              }
            >
              <Icon2
                name="comment-text-outline"
                size={36}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
              <Text style={styles.emptyHint}>Nhấn để xem & viết đánh giá</Text>
            </TouchableOpacity>
          ) : (
            previewReviews.map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar uri={review.user?.avatar} size={36} />
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>
                      {review.user?.name ?? 'Người dùng'}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <StarRow rating={review.rating} size={12} />
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                {review.mediaUrls.length > 0 && (
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={review.mediaUrls}
                    keyExtractor={(_, i) => `${review.id}-${i}`}
                    contentContainerStyle={{ gap: 8, marginTop: 8 }}
                    renderItem={({ item: url, index }) => (
                      <MediaThumb
                        url={url}
                        type={review.mediaTypes?.[index] ?? 'image'}
                        onPress={() =>
                          setLightbox({
                            urls: review.mediaUrls,
                            types:
                              review.mediaTypes ??
                              review.mediaUrls.map(() => 'image' as const),
                            index,
                          })
                        }
                      />
                    )}
                  />
                )}
              </View>
            ))
          )}
        </View>

        {/* Checkins — preview 3, navigate sang CheckinList để xem thêm */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <SectionHeader
            title="Check-in"
            count={checkins.length}
            onSeeAll={() =>
              navigation.navigate('CheckinList', {
                osmId,
                placeName: place.name,
              })
            }
          />

          {checkinsLoading ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginVertical: 24 }}
            />
          ) : previewCheckins.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon2
                name="map-marker-off-outline"
                size={36}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>Chưa có check-in nào</Text>
            </View>
          ) : (
            previewCheckins.map(checkin => (
              <View key={checkin.id} style={styles.checkinRow}>
                <Avatar uri={checkin.user?.avatar} size={32} />
                <View style={styles.checkinInfo}>
                  <Text style={styles.checkinName}>
                    {checkin.user?.name ?? 'Người dùng'}
                  </Text>
                  <Text style={styles.checkinMeta}>
                    {new Date(checkin.createdAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {'  •  '}
                    {checkin.distanceMeters}m
                  </Text>
                </View>
                <View style={styles.checkinBadge}>
                  <Icon2
                    name="map-marker-check"
                    size={14}
                    color={COLORS.success}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 48,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    marginHorizontal: 4,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  heroContainer: { width: '100%', height: 220, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },

  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 14,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    gap: 10,
  },
  placeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: { fontSize: 14, fontWeight: '700', color: COLORS.star },
  ratingCount: { fontSize: 12, color: COLORS.textSub },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addressText: { flex: 1, fontSize: 13, color: COLORS.textSub, lineHeight: 18 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: { fontSize: 11, color: COLORS.primary, fontWeight: '500' },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 14,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionBtnOutline: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionBtnOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionBtnDisabled: { opacity: 0.5 },

  loginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginBannerText: { fontSize: 12, color: COLORS.primary },

  section: { marginTop: 20, marginHorizontal: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontWeight: '400', color: COLORS.textSub },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  mediaList: { gap: 8 },
  mediaItem: { position: 'relative', borderRadius: 10, overflow: 'hidden' },
  mediaThumb: { width: 110, height: 80, borderRadius: 10 },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  reviewMeta: { flex: 1, gap: 3 },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  reviewDate: { fontSize: 11, color: COLORS.textLight },
  reviewComment: { fontSize: 13, color: COLORS.textSub, lineHeight: 19 },
  reviewMedia: { width: 72, height: 72, borderRadius: 8, marginRight: 6 },

  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  checkinInfo: { flex: 1 },
  checkinName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  checkinMeta: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  checkinBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8FFF6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  emptyText: { fontSize: 13, color: COLORS.textLight },
  emptyHint: { fontSize: 12, color: COLORS.primary },
  actionBtnIcon: {
    flex: 0,
    width: 46,
    paddingHorizontal: 0,
  },
});
