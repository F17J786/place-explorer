import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  reviewSchema,
  type ReviewFormValues,
} from '@/schemas/validationSchemas';
import { MAX_MEDIA, COLORS, RATING_HINT_LABELS } from '@/constants/constants';
import { styles } from '@/constants/stylesReviewListScreen';
import type { MediaItem } from '@/types/reviewListScreen.types';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from '@/utils/cloudinaryUpload';

interface WriteReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  initialMedia?: MediaItem[];
  submitLabel?: string;
  onSubmit: (rating: number, comment: string, media: MediaItem[]) => void;
  onCancel?: () => void;
  loading: boolean;
}

export const WriteReviewForm = ({
  initialRating = 0,
  initialComment = '',
  initialMedia = [],
  submitLabel = 'Gửi đánh giá',
  onSubmit,
  onCancel,
  loading,
}: WriteReviewFormProps) => {
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

  const { pickMedia, removeMedia } = useMediaPicker({
    media,
    setMedia: next => setValue('media', next, { shouldDirty: true }),
  });

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
              <View key={i} style={styles.starItem}>
                {hint?.index === i && (
                  <View style={styles.starHintWrap}>
                    <View style={styles.starHint}>
                      <Text style={styles.starHintText}>{hint.text}</Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => {
                    onChange(i);
                    setHint({
                      text: RATING_HINT_LABELS[i],
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
          contentContainerStyle={styles.mediaScrollContent}
          style={styles.mediaScrollWrap}
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
              onPress={pickMedia}
            >
              <Icon name="add" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <View style={styles.formActions}>
        {media.length === 0 && (
          <TouchableOpacity style={styles.mediaPickerBtn} onPress={pickMedia}>
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
            style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
            onPress={handleSubmit(onValid, invalidErrors => {
              console.log('Review form validation errors:', invalidErrors);
            })}
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
