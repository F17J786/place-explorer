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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  reviewSchema,
  type ReviewFormValues,
} from '@/schemas/validationSchemas';
import { MAX_MEDIA, RATING_HINT_KEYS } from '@/constants/constants';
import type { MediaItem } from '@/types/reviewListScreen.types';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from '@/utils/cloudinaryUpload';
import { createErrorTranslator } from '@/utils/formError';
import { useReviewListScreenStyles } from '@/hooks/useReviewListScreenStyles';

interface WriteReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  initialMedia?: MediaItem[];
  submitLabel?: string;
  onSubmit: (rating: number, comment: string, media: MediaItem[]) => void;
  onCancel?: () => void;
  loading: boolean;
}

const translateError = createErrorTranslator('review');

export const WriteReviewForm = ({
  initialRating = 0,
  initialComment = '',
  initialMedia = [],
  submitLabel,
  onSubmit,
  onCancel,
  loading,
}: WriteReviewFormProps) => {
  const { t } = useTranslation('review');
  const [uploading, setUploading] = useState(false);
  const [hint, setHint] = useState<{ text: string; index: number } | null>(
    null,
  );
  const { styles, colors } = useReviewListScreenStyles();
  const navigation = useNavigation();

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
        Alert.alert(t('unsavedChanges.title'), t('unsavedChanges.message'), [
          { text: t('unsavedChanges.stay'), style: 'cancel' },
          {
            text: t('unsavedChanges.leave'),
            style: 'destructive',
            onPress: () => {
              onCancel?.();
              navigation.goBack();
            },
          },
        ]);
        return true;
      };
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, [isDirty, onCancel, t]),
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
      Alert.alert(t('uploadError.title'), t('uploadError.message'));
    } finally {
      setUploading(false);
    }
  };

  const isLoading = loading || uploading;

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{t('writeReview.formTitle')}</Text>

      <Text style={styles.ratingLabel}>{t('writeReview.ratingLabel')}</Text>
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
                      text: t(RATING_HINT_KEYS[i]),
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
                    color={colors.star}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />
      {errors.rating && (
        <Text style={styles.errorText}>
          {translateError(errors.rating.message)}
        </Text>
      )}

      <Controller
        control={control}
        name="comment"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.reviewInput, errors.comment && styles.inputError]}
            placeholder={t('writeReview.commentPlaceholder')}
            placeholderTextColor={colors.textLight}
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
        <Text style={styles.errorText}>
          {translateError(errors.comment.message)}
        </Text>
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
                  <Icon name="videocam" size={26} color={colors.white} />
                </View>
              ) : (
                <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
              )}
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={() => removeMedia(index)}
              >
                <Icon name="close" size={12} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
          {media.length < MAX_MEDIA && (
            <TouchableOpacity
              style={styles.addMoreMediaBtn}
              onPress={pickMedia}
            >
              <Icon name="add" size={24} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <View style={styles.formActions}>
        {media.length === 0 && (
          <TouchableOpacity style={styles.mediaPickerBtn} onPress={pickMedia}>
            <Icon name="add-photo-alternate" size={20} color={colors.primary} />
            <Text style={styles.mediaPickerText}>
              {t('writeReview.addMedia')}
            </Text>
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
              <Text style={styles.cancelBtnText}>
                {t('writeReview.cancel')}
              </Text>
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
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Icon name="send" size={15} color={colors.white} />
                <Text style={styles.submitBtnText}>
                  {submitLabel ?? t('writeReview.submit')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
