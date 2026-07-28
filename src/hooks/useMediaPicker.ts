import { Alert } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import {
  MAX_MEDIA,
  MAX_IMAGE_SIZE,
  MIN_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_VIDEO_DURATION,
} from '@/constants/constants';
import type { MediaItem } from '@/types/reviewListScreen.types';

interface UseMediaPickerParams {
  media: MediaItem[];
  setMedia: (media: MediaItem[]) => void;
}

export const useMediaPicker = ({ media, setMedia }: UseMediaPickerParams) => {
  const { t } = useTranslation('review');

  const pickMedia = () => {
    if (media.length >= MAX_MEDIA) {
      Alert.alert(
        t('mediaPicker.limitReached.title'),
        t('mediaPicker.limitReached.message', { max: MAX_MEDIA }),
      );
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
              Alert.alert(
                t('mediaPicker.videoTooLarge.title'),
                t('mediaPicker.videoTooLarge.message', {
                  fileName: asset.fileName,
                  maxSizeMb: Math.round(MAX_VIDEO_SIZE / (1024 * 1024)),
                }),
              );
              continue;
            }
            if ((asset.duration ?? 0) > MAX_VIDEO_DURATION) {
              Alert.alert(
                t('mediaPicker.videoTooLong.title'),
                t('mediaPicker.videoTooLong.message', {
                  fileName: asset.fileName,
                  maxSeconds: MAX_VIDEO_DURATION,
                }),
              );
              continue;
            }
          } else {
            if ((asset.fileSize ?? 0) < MIN_IMAGE_SIZE) {
              Alert.alert(
                t('mediaPicker.imageTooSmall.title'),
                t('mediaPicker.imageTooSmall.message', {
                  fileName: asset.fileName,
                  minSizeKb: Math.round(MIN_IMAGE_SIZE / 1024),
                }),
              );
              continue;
            }
            if ((asset.fileSize ?? 0) > MAX_IMAGE_SIZE) {
              Alert.alert(
                t('mediaPicker.imageTooLarge.title'),
                t('mediaPicker.imageTooLarge.message', {
                  fileName: asset.fileName,
                  maxSizeMb: Math.round(MAX_IMAGE_SIZE / (1024 * 1024)),
                }),
              );
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
        setMedia([...media, ...valid].slice(0, MAX_MEDIA));
      },
    );
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return { pickMedia, removeMedia };
};
