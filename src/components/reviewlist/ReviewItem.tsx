import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PlaceDetailStackParamList } from '@/types/navigation';
import type { Review } from '@/types/placeDetail.types';
import MediaThumb, { MediaLightbox } from '@/components/review/MediaThumb';
import { COLORS } from '@/constants/constants';
import { styles } from '@/constants/stylesReviewListScreen';
import { StarRow } from '../placedetail/StarRow';
import { Avatar } from '../placedetail/Avatar';
import { formatDate } from '@/utils/dateFormat';

type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ReviewList'
>;

interface ReviewItemProps {
  item: Review;
  currentUserId?: string;
  onEdit: (item: Review) => void;
  onDelete: (id: string, userId: string) => void;
}

export const ReviewItem = ({
  item,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewItemProps) => {
  const { t } = useTranslation('review');
  const isOwn = currentUserId === String(item.userId);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NavProp>();

  const goToProfile = () => {
    navigation.navigate('ProfileReview', {
      userId: item.userId,
      name: item.user?.name,
      avatar: item.user?.avatar,
    });
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    Alert.alert(t('deleteConfirm.title'), t('deleteConfirm.message'), [
      { text: t('deleteConfirm.cancel'), style: 'cancel' },
      {
        text: t('common:button.delete'),
        style: 'destructive',
        onPress: () => onDelete(item.id, String(item.userId)),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={goToProfile} hitSlop={styles.hitSlop2}>
          <Avatar uri={item.user?.avatar} size={38} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardMeta}
          onPress={goToProfile}
          activeOpacity={0.6}
        >
          <Text style={styles.userName}>
            {item.user?.name ?? t('common:anonymousUser')}
          </Text>
          <View style={styles.ratingRow}>
            <StarRow rating={item.rating} size={13} />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        {isOwn && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                hitSlop={styles.hitSlop3}
              >
                <Icon name="more-vert" size={20} color={COLORS.textSub} />
              </TouchableOpacity>
            }
          >
            <Pressable
              android_ripple={{ color: COLORS.primaryLight }}
              onPress={() => {
                setMenuVisible(false);
                onEdit(item);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: COLORS.border },
              ]}
            >
              <Icon2 name="pencil-outline" size={16} color={COLORS.text} />
              <Text style={styles.menuItemText}>{t('menu.editReview')}</Text>
            </Pressable>

            <Pressable
              android_ripple={{ color: 'rgba(239,68,68,0.1)' }}
              onPress={confirmDelete}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: COLORS.border },
              ]}
            >
              <Icon2 name="delete-outline" size={16} color={COLORS.danger} />
              <Text style={[styles.menuItemText, { color: COLORS.danger }]}>
                {t('menu.deleteReview')}
              </Text>
            </Pressable>
          </Menu>
        )}
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      {item.mediaUrls.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={item.mediaUrls}
          keyExtractor={(_, i) => `${item.id}-${i}`}
          contentContainerStyle={styles.mediaContent}
          renderItem={({ item: url, index }) => (
            <MediaThumb
              url={url}
              type={item.mediaTypes?.[index] ?? 'image'}
              onPress={() => setLightboxIndex(index)}
            />
          )}
        />
      )}

      {lightboxIndex !== null && (
        <MediaLightbox
          mediaUrls={item.mediaUrls}
          mediaTypes={item.mediaTypes ?? item.mediaUrls.map(() => 'image')}
          initialIndex={lightboxIndex}
          visible
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </View>
  );
};
