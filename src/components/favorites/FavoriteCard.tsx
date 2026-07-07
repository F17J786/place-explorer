import React from 'react';
import { Text, View, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '@/constants/constants';
import type { Favorite, PlaceRecord } from '@/types/placeDetail.types';
import { CATEGORY_ICON, CATEGORY_COLOR } from '@/constants/constants';
import { styles } from '@/constants/stylesFavoritesScreen';

type FavoriteCardProps = {
  item: Favorite;
  place?: PlaceRecord;
  selected: boolean;
  isSelecting: boolean;
  onPress: () => void;
  onDelete: () => void;
};

export const FavoriteCard = React.memo(
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
        <View style={[styles.iconBadge, { backgroundColor: iconColor + '1A' }]}>
          <Icon name={iconName} size={22} color={iconColor} />
        </View>

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

        {isSelecting ? (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Icon name="check" size={14} color="#fff" />}
          </View>
        ) : (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={styles.hitSlop}
            style={styles.deleteBtn}
          >
            <Icon name="delete-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </Pressable>
    );
  },
);
