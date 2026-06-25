import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetReviewsByOsmIdQuery,
  useCreateReviewMutation,
} from '@/store/api/placeDetailApi';
import type { Review } from '@/types/placeDetail.types';
import { PlaceDetailStackParamList } from '@/types/navigation';

const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1447B8',
  primaryLight: '#EBF0FF',
  white: '#FFFFFF',
  bg: '#F7F9FF',
  text: '#0F172A',
  textSub: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  star: '#F59E0B',
  overlay: 'rgba(15,23,42,0.55)',
  cardShadow: 'rgba(26,86,219,0.08)',
};

type RoutePropType = RouteProp<PlaceDetailStackParamList, 'ReviewList'>;
type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ReviewList'
>;

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

const Avatar = ({ uri, size = 38 }: { uri?: string; size?: number }) => (
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
        <Icon name="person" size={size * 0.55} color={COLORS.primary} />
      </View>
    )}
  </View>
);

const ReviewItem = ({ item }: { item: Review }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Avatar uri={item.user?.avatar} size={38} />
      <View style={styles.cardMeta}>
        <Text style={styles.userName}>
          {item.user?.name ?? 'Người dùng ẩn danh'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StarRow rating={item.rating} size={13} />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingBadgeText}>{item.rating}.0</Text>
      </View>
    </View>
    <Text style={styles.comment}>{item.comment}</Text>
    {item.mediaUrls.length > 0 && (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10 }}
      >
        {item.mediaUrls.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={styles.mediaThumb} />
        ))}
      </ScrollView>
    )}
  </View>
);

// ── Write Review Modal ────────────────────────────────────────────────────────

const WriteReviewModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  loading: boolean;
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) {
      Alert.alert('Thiếu nội dung', 'Vui lòng nhập nhận xét của bạn.');
      return;
    }
    onSubmit(rating, comment.trim());
    setRating(5);
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Viết đánh giá</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={22} color={COLORS.textSub} />
            </TouchableOpacity>
          </View>

          <Text style={styles.ratingLabel}>Đánh giá của bạn</Text>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Icon
                  name={i <= rating ? 'star' : 'star-border'}
                  size={38}
                  color={COLORS.star}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>
            {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating]}
          </Text>

          <TextInput
            style={styles.reviewInput}
            placeholder="Chia sẻ trải nghiệm của bạn tại đây..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Icon name="send" size={16} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ReviewListScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavProp>();
  const { osmId, placeName } = route.params;

  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;

  const [modalVisible, setModalVisible] = useState(false);

  const { data: reviews = [], isLoading } = useGetReviewsByOsmIdQuery(osmId);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (rating: number, comment: string) => {
    if (!user) return;
    await createReview({
      osmId,
      userId: user.id,
      rating,
      comment,
      mediaUrls: [],
      mediaTypes: [],
      createdAt: new Date().toISOString(),
    });
    setModalVisible(false);
  };

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Đánh giá
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {placeName}
          </Text>
        </View>
        {isLoggedIn ? (
          <TouchableOpacity
            style={styles.writeBtn}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="rate-review" size={16} color={COLORS.white} />
            <Text style={styles.writeBtnText}>Viết</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={{ marginTop: 60 }}
            />
          ) : (
            <View style={styles.empty}>
              <Icon2
                name="comment-text-outline"
                size={56}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
              {isLoggedIn ? (
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => setModalVisible(true)}
                >
                  <Icon name="rate-review" size={14} color={COLORS.primary} />
                  <Text style={styles.emptyActionText}>
                    Viết đánh giá đầu tiên
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.emptyText}>Đăng nhập để viết đánh giá</Text>
              )}
            </View>
          )
        }
        ListHeaderComponent={
          reviews.length > 0 ? (
            <View style={styles.summaryCard}>
              {/* Overall score */}
              <View style={styles.scoreBlock}>
                <Text style={styles.scoreNum}>{avgRating}</Text>
                <StarRow rating={Math.round(Number(avgRating))} size={18} />
                <Text style={styles.scoreCount}>{reviews.length} đánh giá</Text>
              </View>
              {/* Distribution */}
              <View style={styles.distBlock}>
                {ratingDist.map(({ star, count, pct }) => (
                  <View key={star} style={styles.distRow}>
                    <Text style={styles.distStar}>{star}</Text>
                    <Icon name="star" size={11} color={COLORS.star} />
                    <View style={styles.distBar}>
                      <View style={[styles.distFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.distCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => <ReviewItem item={item} />}
      />

      <WriteReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </View>
  );
};

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
  },
  backBtn: { padding: 9 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 4,
  },
  writeBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },

  list: { padding: 14, gap: 10 },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    gap: 16,
  },
  scoreBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 72,
  },
  scoreNum: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 44,
  },
  scoreCount: { fontSize: 11, color: COLORS.textSub, marginTop: 2 },
  distBlock: { flex: 1, gap: 5, justifyContent: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  distStar: {
    fontSize: 12,
    color: COLORS.textSub,
    width: 10,
    textAlign: 'right',
  },
  distBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distFill: { height: '100%', backgroundColor: COLORS.star, borderRadius: 3 },
  distCount: {
    fontSize: 11,
    color: COLORS.textSub,
    width: 16,
    textAlign: 'right',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  cardMeta: { flex: 1, gap: 4 },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  dateText: { fontSize: 11, color: COLORS.textLight },
  ratingBadge: {
    backgroundColor: COLORS.star,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  comment: { fontSize: 13, color: COLORS.textSub, lineHeight: 20 },
  mediaThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 6 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textSub },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyActionText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  ratingLabel: { fontSize: 13, color: COLORS.textSub, marginBottom: 10 },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  ratingHint: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 14,
    height: 18,
  },
  reviewInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 110,
    marginBottom: 16,
    backgroundColor: COLORS.bg,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
