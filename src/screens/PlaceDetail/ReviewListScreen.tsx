import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Pressable,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
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
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@/store/api/placeDetailApi';
import type { Review } from '@/types/placeDetail.types';
import { PlaceDetailStackParamList } from '@/types/navigation';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import axios from 'axios';
import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheet,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import MediaThumb, { MediaLightbox } from '@/components/review/MediaThumb';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  reviewSchema,
  type ReviewFormValues,
} from '@/schemas/validationSchemas';
import { BackHandler } from 'react-native';
import { toast } from '@baronha/ting';
import { Divider, Menu } from 'react-native-paper';
// ── Constants ─────────────────────────────────────────────────────────────────

const CLOUDINARY_UPLOAD_PRESET = 'test_word';
const CLOUDINARY_CLOUD_NAME = 'dzjbxwjvs';

export const MAX_MEDIA = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MIN_IMAGE_SIZE = 10 * 1024; // 10 KB
const MAX_VIDEO_SIZE = 75 * 1024 * 1024; // 75 MB
const MAX_VIDEO_DURATION = 30; // seconds

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
  gray: '#D1D5DB',
  star: '#F59E0B',
  overlay: 'rgba(15,23,42,0.55)',
  cardShadow: 'rgba(26,86,219,0.08)',
  danger: '#EF4444',
};

type RoutePropType = RouteProp<PlaceDetailStackParamList, 'ReviewList'>;
type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ReviewList'
>;

type FilterType = 'newest' | 1 | 2 | 3 | 4 | 5;

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
  duration?: number; // seconds, video only
}

// ── Cloudinary helpers ────────────────────────────────────────────────────────

const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `image_${Date.now()}.jpg`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'works/images');
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.secure_url;
};

const uploadVideoToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'video/mp4',
    name: `video_${Date.now()}.mp4`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'works/videos');
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.secure_url;
};

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

// ── BottomSheet inner components (must be children of BottomSheet) ────────────

const FilterHandleComponent = ({ title }: { title: string }) => {
  const { close } = useBottomSheet();
  return (
    <View style={styles.bsHandle}>
      <View style={styles.bsHandleBar} />
      <View style={styles.bsHandleRow}>
        <Text style={styles.bsHandleTitle}>{title}</Text>
        <TouchableOpacity
          onPress={() => close()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 10 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="close" size={20} color={COLORS.textSub} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FilterApplyButton = ({ onApply }: { onApply: () => void }) => {
  const { close } = useBottomSheet();
  return (
    <TouchableOpacity
      style={styles.bsApplyBtn}
      onPress={() => {
        onApply();
        close();
      }}
    >
      <Text style={styles.bsApplyText}>Áp dụng</Text>
    </TouchableOpacity>
  );
};

// ── ReviewItem ────────────────────────────────────────────────────────────────

const ReviewItem = ({
  item,
  currentUserId,
  onEdit,
  onDelete,
}: {
  item: Review;
  currentUserId?: string;
  onEdit: (item: Review) => void;
  onDelete: (id: string) => void;
}) => {
  const isOwn = currentUserId === item.userId;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenu = () => {
    Alert.alert('Tùy chọn', undefined, [
      { text: 'Chỉnh sửa', onPress: () => onEdit(item) },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Xác nhận', 'Bạn muốn xóa đánh giá này?', [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xóa',
              style: 'destructive',
              onPress: () => onDelete(item.id),
            },
          ]),
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  return (
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
        {isOwn && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={{ borderRadius: 14, backgroundColor: COLORS.white }}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              <Text style={styles.menuItemText}>Chỉnh sửa xếp hạng</Text>
            </Pressable>

            <Pressable
              android_ripple={{ color: 'rgba(239,68,68,0.1)' }}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Xác nhận', 'Bạn muốn xóa đánh giá này?', [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => onDelete(item.id),
                  },
                ]);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: COLORS.border },
              ]}
            >
              <Icon2 name="delete-outline" size={16} color={COLORS.danger} />
              <Text style={[styles.menuItemText, { color: COLORS.danger }]}>
                Xoá bài đánh giá
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
          contentContainerStyle={{ gap: 8, marginTop: 10 }}
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

const WriteReviewForm = ({
  initialRating = 0,
  initialComment = '',
  initialMedia = [] as MediaItem[],
  submitLabel = 'Gửi đánh giá',
  onSubmit,
  onCancel,
  loading,
}: {
  initialRating?: number;
  initialComment?: string;
  initialMedia?: MediaItem[];
  submitLabel?: string;
  onSubmit: (rating: number, comment: string, media: MediaItem[]) => void;
  onCancel?: () => void;
  loading: boolean;
}) => {
  const [uploading, setUploading] = useState(false);
  const [hint, setHint] = useState<{ text: string; index: number } | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialRating,
      comment: initialComment,
      media: initialMedia,
    },
  });

  const media = watch('media');

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!isDirty) return false;
        Alert.alert(
          'Chưa gửi đánh giá',
          'Bạn có thay đổi chưa gửi. Muốn thoát không?',
          [
            { text: 'Ở lại', style: 'cancel' },
            {
              text: 'Thoát',
              style: 'destructive',
              onPress: () => onCancel?.(),
            },
          ],
        );
        return true;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, [isDirty, onCancel]),
  );

  const handlePickMedia = async () => {
    if (media.length >= MAX_MEDIA) {
      Alert.alert('Giới hạn', `Tối đa ${MAX_MEDIA} ảnh/video.`);
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: MAX_MEDIA - media.length,
        includeExtra: true,
      },
      response => {
        if (response.didCancel || !response.assets) return;
        const valid: MediaItem[] = [];
        for (const asset of response.assets as Asset[]) {
          const isVideo = (asset.type ?? '').startsWith('video');
          if (isVideo) {
            if ((asset.fileSize ?? 0) > MAX_VIDEO_SIZE) {
              Alert.alert('Video quá lớn', `${asset.fileName} vượt quá 75 MB.`);
              continue;
            }
            if ((asset.duration ?? 0) > MAX_VIDEO_DURATION) {
              Alert.alert(
                'Video quá dài',
                `${asset.fileName} vượt quá 30 giây.`,
              );
              continue;
            }
          } else {
            if ((asset.fileSize ?? 0) < MIN_IMAGE_SIZE) {
              Alert.alert('Ảnh quá nhỏ', `${asset.fileName} nhỏ hơn 10 KB.`);
              continue;
            }
            if ((asset.fileSize ?? 0) > MAX_IMAGE_SIZE) {
              Alert.alert('Ảnh quá lớn', `${asset.fileName} vượt quá 5 MB.`);
              continue;
            }
          }
          valid.push({
            uri: asset.uri!,
            type: isVideo ? 'video' : 'image',
            fileName: asset.fileName,
            fileSize: asset.fileSize,
            duration: asset.duration,
          });
        }
        setValue('media', [...media, ...valid].slice(0, MAX_MEDIA), {
          shouldDirty: true,
        });
      },
    );
  };

  const removeMedia = (index: number) => {
    setValue(
      'media',
      media.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const onValid = async (values: ReviewFormValues) => {
    setUploading(true);
    try {
      const uploadedMedia: MediaItem[] = await Promise.all(
        values.media.map(async item => {
          if (item.uri.startsWith('http')) return item;
          const url =
            item.type === 'video'
              ? await uploadVideoToCloudinary(item.uri)
              : await uploadImageToCloudinary(item.uri);
          return { ...item, uri: url };
        }),
      );
      onSubmit(values.rating, values.comment, uploadedMedia);
    } catch {
      Alert.alert('Lỗi', 'Upload media thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const isLoading = loading || uploading;

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Viết đánh giá</Text>

      <Text style={styles.ratingLabel}>Đánh giá của bạn</Text>
      <Controller
        control={control}
        name="rating"
        render={({ field: { value, onChange } }) => (
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map(i => (
              <View
                key={i}
                style={{
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {hint?.index === i && (
                  <View
                    style={{
                      position: 'absolute',
                      zIndex: 10,
                      left: -100,
                      right: -100,
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <View style={styles.starHint}>
                      <Text style={styles.starHintText}>{hint.text}</Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    onChange(i);
                    setHint({
                      text: [
                        '',
                        'Rất tệ',
                        'Tệ',
                        'Bình thường',
                        'Tốt',
                        'Tuyệt vời',
                      ][i],
                      index: i,
                    });
                    setTimeout(() => setHint(null), 1500);
                  }}
                  activeOpacity={0.7}
                  accessible={false}
                >
                  <Icon
                    name={i <= value ? 'star' : 'star-border'}
                    size={36}
                    color={COLORS.star}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />
      {errors.rating && (
        <Text style={styles.errorText}>{errors.rating.message}</Text>
      )}

      <Controller
        control={control}
        name="comment"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.reviewInput, errors.comment && styles.inputError]}
            placeholder="Chia sẻ trải nghiệm của bạn tại đây..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            textAlignVertical="top"
          />
        )}
      />
      {errors.comment && (
        <Text style={styles.errorText}>{errors.comment.message}</Text>
      )}

      {media.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 0 }}
          style={{ marginBottom: 12, overflow: 'visible' }}
        >
          {media.map((item, index) => (
            <View key={index} style={styles.mediaPreviewWrap}>
              {item.type === 'video' ? (
                <View style={[styles.mediaThumb, styles.videoThumbFallback]}>
                  <Icon name="videocam" size={26} color={COLORS.white} />
                </View>
              ) : (
                <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
              )}
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={() => removeMedia(index)}
              >
                <Icon name="close" size={12} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
          {media.length < MAX_MEDIA && (
            <TouchableOpacity
              style={styles.addMoreMediaBtn}
              onPress={handlePickMedia}
            >
              <Icon name="add" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <View style={styles.formActions}>
        {media.length === 0 && (
          <TouchableOpacity
            style={styles.mediaPickerBtn}
            onPress={handlePickMedia}
          >
            <Icon name="add-photo-alternate" size={20} color={COLORS.primary} />
            <Text style={styles.mediaPickerText}>Thêm ảnh/video</Text>
            <Text style={styles.mediaCount}>
              {media.length}/{MAX_MEDIA}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.submitRow}>
          {onCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit(onValid)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Icon name="send" size={15} color={COLORS.white} />
                <Text style={styles.submitBtnText}>{submitLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const FilterBottomSheet = ({
  bsRef,
  activeFilter,
  onApply,
}: {
  bsRef: React.RefObject<BottomSheet | null>;
  activeFilter: FilterType;
  onApply: (filter: FilterType) => void;
}) => {
  const [temp, setTemp] = useState<FilterType>(activeFilter);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80, // độ nảy
    overshootClamping: true,
    stiffness: 700, // độ cứng — cao hơn = nhanh hơn
  });

  const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 5, label: '⭐⭐⭐⭐⭐  5 sao' },
    { id: 4, label: '⭐⭐⭐⭐  4 sao' },
    { id: 3, label: '⭐⭐⭐  3 sao' },
    { id: 2, label: '⭐⭐  2 sao' },
    { id: 1, label: '⭐  1 sao' },
  ];

  const handleApply = () => onApply(temp);

  const handleClear = () => setTemp('newest');

  return (
    <BottomSheet
      ref={bsRef}
      index={-1}
      snapPoints={['44%']}
      enablePanDownToClose
      enableDynamicSizing={false}
      handleComponent={() => <FilterHandleComponent title="Bộ lọc" />}
      backgroundStyle={{ borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
      animationConfigs={animationConfigs}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
      footerComponent={() => (
        <View style={styles.bsFooter}>
          <TouchableOpacity style={styles.bsClearBtn} onPress={handleClear}>
            <Text style={styles.bsClearText}>Xóa</Text>
          </TouchableOpacity>
          <FilterApplyButton onApply={handleApply} />
        </View>
      )}
    >
      <View style={styles.bsContent}>
        <Text style={styles.bsSectionTitle}>Sắp xếp theo</Text>
        <View style={styles.bsChipRow}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={String(opt.id)}
              style={[styles.bsChip, temp === opt.id && styles.bsChipActive]}
              onPress={() => setTemp(opt.id)}
            >
              {temp === opt.id && (
                <Icon
                  name="check"
                  size={13}
                  color={COLORS.primary}
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[
                  styles.bsChipText,
                  temp === opt.id && styles.bsChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export const ReviewListScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavProp>();
  const { osmId, placeName } = route.params;

  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;

  const filterBsRef = useRef<BottomSheet>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('newest');

  // Edit state
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const { data: reviews = [], isLoading } = useGetReviewsByOsmIdQuery(osmId);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  // ── Derived data ────────────────────────────────────────────────────────────

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (activeFilter === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      result = result.filter(r => r.rating === activeFilter);
    }
    return result;
  }, [reviews, activeFilter]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreate = async (
    rating: number,
    comment: string,
    media: MediaItem[],
  ) => {
    if (!user) return;
    await createReview({
      osmId,
      userId: user.id,
      rating,
      comment,
      mediaUrls: media.map(m => m.uri),
      mediaTypes: media.map(m => m.type),
      createdAt: new Date().toISOString(),
    });
  };

  const handleUpdate = async (
    rating: number,
    comment: string,
    media: MediaItem[],
  ) => {
    if (!editingReview) return;
    await updateReview({
      id: editingReview.id,
      osmId: editingReview.osmId,
      rating,
      comment,
      mediaUrls: media.map(m => m.uri),
      mediaTypes: media.map(m => m.type),
      createdAt: new Date().toISOString(),
    });
    setEditingReview(null);
  };

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteReview({ id, osmId });
    },
    [deleteReview, osmId],
  );
  const handleEditStart = useCallback((item: Review) => {
    setEditingReview(item);
  }, []);

  // ── Already reviewed? ───────────────────────────────────────────────────────

  const myReview = user ? reviews.find(r => r.userId === user.id) : undefined;
  const showCreateForm = isLoggedIn && !myReview && !editingReview;
  const showEditForm = !!editingReview;

  // ── List header ─────────────────────────────────────────────────────────────

  const ListHeader = (
    <View>
      {/* Summary card */}
      {reviews.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreNum}>{avgRating}</Text>
            <StarRow rating={Math.round(Number(avgRating))} size={18} />
            <Text style={styles.scoreCount}>{reviews.length} đánh giá</Text>
          </View>
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
      )}

      {/* Write / Edit form */}
      {showEditForm && editingReview && (
        <WriteReviewForm
          initialRating={editingReview.rating}
          initialComment={editingReview.comment}
          initialMedia={editingReview.mediaUrls.map((uri, i) => ({
            uri,
            type: (editingReview.mediaTypes?.[i] ?? 'image') as
              | 'image'
              | 'video',
          }))}
          submitLabel="Cập nhật"
          onSubmit={handleUpdate}
          onCancel={() => setEditingReview(null)}
          loading={updating}
        />
      )}

      {showCreateForm && (
        <WriteReviewForm onSubmit={handleCreate} loading={submitting} />
      )}

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => filterBsRef.current?.expand()}
        >
          <View style={styles.iconWrapper}>
            <Icon name="tune" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.filterBtnText}>Bộ lọc</Text>
        </TouchableOpacity>
        {activeFilter !== 'newest' && (
          <TouchableOpacity
            onPress={() => setActiveFilter('newest')}
            style={styles.filterClearChip}
          >
            <Text style={styles.filterClearChipText}>
              {`${activeFilter} sao`}
            </Text>
            <Icon
              name="close"
              size={12}
              style={{ marginTop: 1.5 }}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReviews}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={styles.empty}>
              <Icon2
                name="comment-text-outline"
                size={52}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
              {!isLoggedIn && (
                <Text style={styles.emptyText}>Đăng nhập để viết đánh giá</Text>
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
            currentUserId={user?.id}
            onEdit={handleEditStart}
            onDelete={handleDelete}
          />
        )}
      />

      <FilterBottomSheet
        bsRef={filterBsRef}
        activeFilter={activeFilter}
        onApply={setActiveFilter}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  list: { padding: 14, gap: 10 },

  // Summary
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
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

  // Write form
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  ratingLabel: { fontSize: 13, color: COLORS.textSub, marginBottom: 8 },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  starHint: {
    position: 'absolute',
    bottom: 7,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
  },
  starHintText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingHint: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
    height: 18,
  },
  reviewInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
  },
  mediaPreviewWrap: { marginRight: 8, position: 'relative', zIndex: 1 },
  removeMediaBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreMediaBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  formActions: { gap: 10 },
  mediaPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryLight,
  },
  mediaPickerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  mediaCount: { fontSize: 12, color: COLORS.textLight },
  submitRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSub },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 2,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlignVertical: 'center',
  },
  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.danger,
    marginLeft: 2,
  },
  filterClearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterClearChipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Review card
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
  comment: { fontSize: 13, color: COLORS.textSub, lineHeight: 20 },
  mediaThumb: { width: 80, height: 80, borderRadius: 8 },
  videoThumb: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textSub },

  // Bottom sheet
  bsHandle: {
    paddingHorizontal: 16,
    paddingBottom: 9,
  },
  bsHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  bsHandleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bsHandleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'left',
  },
  bsContent: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 14 },
  bsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 13,
  },
  bsChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  bsChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  bsChipText: { fontSize: 13, color: COLORS.textSub, fontWeight: '500' },
  bsChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  bsFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  bsClearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  bsClearText: { fontSize: 14, fontWeight: '600', color: COLORS.textSub },
  bsApplyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    elevation: 2,
  },
  bsApplyText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: -8,
    marginBottom: 8,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  videoThumbFallback: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
