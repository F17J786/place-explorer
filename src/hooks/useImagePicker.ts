import { useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';

const IMAGE_PICKER_OPTIONS: ImageLibraryOptions & CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 512,
  maxHeight: 512,
  includeBase64: false,
};

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Quyền truy cập camera',
      message: 'Ứng dụng cần quyền camera để chụp ảnh đại diện',
      buttonPositive: 'Đồng ý',
      buttonNegative: 'Huỷ',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const useImagePicker = () => {
  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    const result = await launchImageLibrary(IMAGE_PICKER_OPTIONS);

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }, []);

  const pickFromCamera = useCallback(async (): Promise<string | null> => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert('Lỗi', 'Cần quyền camera để chụp ảnh');
      return null;
    }

    const result = await launchCamera(IMAGE_PICKER_OPTIONS);

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }, []);

  const showImagePickerOptions = useCallback(
    (onImageSelected: (uri: string) => void) => {
      Alert.alert('Ảnh đại diện', 'Chọn cách thêm ảnh', [
        {
          text: 'Thư viện ảnh',
          onPress: async () => {
            const uri = await pickFromGallery();
            if (uri) {
              onImageSelected(uri);
            }
          },
        },
        {
          text: 'Chụp ảnh',
          onPress: async () => {
            const uri = await pickFromCamera();
            if (uri) {
              onImageSelected(uri);
            }
          },
        },
        { text: 'Huỷ', style: 'cancel' },
      ]);
    },
    [pickFromCamera, pickFromGallery],
  );

  return { pickFromGallery, pickFromCamera, showImagePickerOptions };
};
