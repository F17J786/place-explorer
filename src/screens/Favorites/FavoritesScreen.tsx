import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Pressable,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '@/constants/colors';
import {
  useGetFavoritesByUserQuery,
  useGetPlacesByOsmIdsQuery,
  useRemoveFavoriteMutation,
} from '@/store/api/placeDetailApi';
import { useAppSelector } from '@/store/hooks';
import type { Favorite, PlaceRecord } from '@/types/placeDetail.types';

// ─── Types ────────────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  restaurant: 'silverware-fork-knife',
  cafe: 'coffee',
  hotel: 'bed',
  park: 'tree',
  museum: 'bank',
  shop: 'shopping',
  default: 'map-marker',
};

const CATEGORY_COLOR: Record<string, string> = {
  restaurant: '#F59E0B',
  cafe: '#92400E',
  hotel: '#6366F1',
  park: '#10B981',
  museum: '#8B5CF6',
  shop: '#EC4899',
  default: '#1A56DB',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type FavoriteCardProps = {
  item: Favorite;
  place?: PlaceRecord;
  selected: boolean;
  isSelecting: boolean;
  onPress: () => void;
  onDelete: () => void; // thêm
};

const FavoriteCard = React.memo(
  ({
    item,
    place,
    selected,
    isSelecting,
    onPress,
    onDelete,
  }: FavoriteCardProps) => {
    const iconName =
      CATEGORY_ICON[place?.category ?? 'default'] ?? CATEGORY_ICON.default;
    const iconColor =
      CATEGORY_COLOR[place?.category ?? 'default'] ?? CATEGORY_COLOR.default;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        android_ripple={{ color: '#E8F0FE', borderless: false }}
      >
        {/* Left: icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: iconColor + '1A' }]}>
          <Icon name={iconName} size={22} color={iconColor} />
        </View>

        {/* Middle: info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {place?.name ?? item.osmId}
          </Text>
          {!!place?.address && (
            <View style={styles.cardAddressRow}>
              <Icon
                name="map-marker-outline"
                size={12}
                color={COLORS.textSecondary}
              />
              <Text style={styles.cardAddress} numberOfLines={1}>
                {place.address}
              </Text>
            </View>
          )}
          {!!place?.category && (
            <View
              style={[styles.categoryChip, { borderColor: iconColor + '66' }]}
            >
              <Text style={[styles.categoryText, { color: iconColor }]}>
                {place.category}
              </Text>
            </View>
          )}
        </View>

        {/* Right: checkbox or chevron */}
        {isSelecting ? (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Icon name="check" size={14} color="#fff" />}
          </View>
        ) : (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Icon name="delete-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </Pressable>
    );
  },
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrap}>
      <Icon name="bookmark-off-outline" size={52} color="#1A56DB33" />
    </View>
    <Text style={styles.emptyTitle}>Chưa có địa điểm yêu thích</Text>
    <Text style={styles.emptySubtitle}>
      Nhấn giữ biểu tượng tim trên bản đồ để lưu địa điểm.
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const FavoritesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAppSelector(state => state.auth.user);

  const {
    data: favorites = [],
    isLoading,
    refetch,
  } = useGetFavoritesByUserQuery(user?.id ?? '', { skip: !user?.id });

  const osmIds = useMemo(() => favorites.map(f => f.osmId), [favorites]);

  const { data: places = [] } = useGetPlacesByOsmIdsQuery(osmIds, {
    skip: osmIds.length === 0,
  });

  const placesMap = useMemo(
    () => Object.fromEntries(places.map(p => [p.osmId, p])),
    [places],
  );

  const [removeFavorite] = useRemoveFavoriteMutation();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const isSelecting = isSelectMode && selectedIds.size >= 0;

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useMemo(
    () => favorites.length > 0 && selectedIds.size === favorites.length,
    [favorites.length, selectedIds.size],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSingle = useCallback(
    (item: Favorite) => {
      Alert.alert(
        'Xoá địa điểm',
        `Xoá "${placesMap[item.osmId]?.name ?? item.osmId}" khỏi yêu thích?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xoá',
            style: 'destructive',
            onPress: () =>
              removeFavorite({
                id: item.id,
                userId: user?.id ?? '',
                osmId: item.osmId,
              }),
          },
        ],
      );
    },
    [placesMap, removeFavorite, user],
  );

  const cancelSelect = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favorites.map((f: Favorite) => f.id)));
    }
  }, [isAllSelected, favorites]);

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const count = selectedIds.size;
    Alert.alert(
      'Xoá địa điểm yêu thích',
      `Bạn muốn xoá ${count} địa điểm đã chọn?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            const toDelete = favorites.filter((f: Favorite) =>
              selectedIds.has(f.id),
            );
            await Promise.all(
              toDelete.map((favorite: Favorite) =>
                removeFavorite({
                  id: favorite.id,
                  userId: user?.id ?? '',
                  osmId: favorite.osmId,
                }),
              ),
            );
            setSelectedIds(new Set());
            Alert.alert(
              'Đã xoá',
              `Đã xoá ${count} địa điểm khỏi danh sách yêu thích.`,
            );
          },
        },
      ],
    );
  }, [selectedIds, favorites, removeFavorite, user]);

  const handleCardPress = useCallback(
    (item: Favorite, place?: PlaceRecord) => {
      if (isSelecting) {
        toggleSelect(item.id);
        return;
      }
      navigation.navigate('PlaceDetail', {
        screen: 'PlaceDetailHome',
        params: {
          place: {
            osmId: item.osmId,
            osmType: item.osmId.split('/')[0] ?? 'node',
            name: place?.name ?? item.osmId,
            amenity: place?.category ?? '',
            lat: place?.lat ?? 0,
            lng: place?.lng ?? 0,
            address: place?.address ?? '',
            thumbnailUrl: place?.thumbnailUrl ?? '',
            coordinate: {
              latitude: place?.lat ?? 0,
              longitude: place?.lng ?? 0,
            },
          },
        },
      });
    },
    [isSelecting, toggleSelect, navigation],
  );

  // ── render ───────────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Favorite }) => {
      const place = placesMap[item.osmId];
      return (
        <FavoriteCard
          item={item}
          place={place}
          selected={selectedIds.has(item.id)}
          isSelecting={isSelectMode}
          onPress={() => {
            if (isSelectMode) {
              toggleSelect(item.id);
            } else {
              handleCardPress(item, place);
            }
          }}
          onDelete={() => handleDeleteSingle(item)}
        />
      );
    },
    [
      selectedIds,
      isSelectMode,
      handleCardPress,
      toggleSelect,
      placesMap,
      handleDeleteSingle,
    ],
  );

  const keyExtractor = useCallback((item: Favorite) => String(item.id), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {isSelectMode ? (
          <>
            <TouchableOpacity style={styles.headerBtn} onPress={cancelSelect}>
              <Icon name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                {selectedIds.size > 0
                  ? `Đã chọn ${selectedIds.size}`
                  : 'Chọn địa điểm'}
              </Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerTextBtn}
                  onPress={toggleAll}
                >
                  <Text style={styles.headerTextBtnLabel}>
                    {isAllSelected ? 'Bỏ chọn' : 'Chọn tất cả'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerTextBtn}
                  onPress={handleDelete}
                  disabled={selectedIds.size === 0}
                >
                  <Text
                    style={[
                      styles.headerTextBtnLabel,
                      styles.headerDangerText,
                      selectedIds.size === 0 && { opacity: 0.4 },
                    ]}
                  >
                    Xoá
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Yêu thích</Text>

              {favorites.length > 0 && (
                <TouchableOpacity
                  style={styles.headerTextBtn}
                  onPress={enterSelectMode}
                >
                  <Text style={styles.headerTextBtnLabel}>Xoá</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A56DB" />
        </View>
      ) : (
        <FlatList
          data={favorites as Favorite[]}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            favorites.length === 0 && styles.listContentEmpty,
          ]}
          style={{ marginTop: 50 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState />}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 125,
    zIndex: 0,
  },
  headerBtn: {
    padding: 4,
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBadge: {
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // List
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  listContentEmpty: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 12,
  },
  cardSelected: {
    borderColor: '#1A56DB',
    backgroundColor: '#F0F5FF',
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F1729',
  },
  cardAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardAddress: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F1729',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Selection bar
  selectionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EEFF',
    elevation: 8,
  },
  selectionBarBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  selectionBarBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  selectionBarBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  selectionBarBtnDanger: {
    backgroundColor: '#EF4444',
  },
  selectionBarBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  headerTextBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTextBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DBEAFE',
  },
  headerDangerText: {
    color: '#EF4444',
  },
  deleteBtn: {
    padding: 4,
  },
});
