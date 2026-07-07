import { Alert } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
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
  const pickMedia = () => {
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
        setMedia([...media, ...valid].slice(0, MAX_MEDIA));
      },
    );
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return { pickMedia, removeMedia };
};
