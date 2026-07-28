import { useCallback } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

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
      title: i18n.t('auth:imagePicker.cameraPermission.title'),
      message: i18n.t('auth:imagePicker.cameraPermission.message'),
      buttonPositive: i18n.t('auth:imagePicker.cameraPermission.accept'),
      buttonNegative: i18n.t('common:button.cancel'),
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const useImagePicker = () => {
  const { t } = useTranslation('auth');

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
      Alert.alert(
        t('imagePicker.error.title'),
        t('imagePicker.error.cameraPermissionNeeded'),
      );
      return null;
    }

    const result = await launchCamera(IMAGE_PICKER_OPTIONS);

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }, [t]);

  const showImagePickerOptions = useCallback(
    (onImageSelected: (uri: string) => void) => {
      Alert.alert(
        t('imagePicker.chooser.title'),
        t('imagePicker.chooser.message'),
        [
          {
            text: t('imagePicker.chooser.gallery'),
            onPress: async () => {
              const uri = await pickFromGallery();
              if (uri) {
                onImageSelected(uri);
              }
            },
          },
          {
            text: t('imagePicker.chooser.camera'),
            onPress: async () => {
              const uri = await pickFromCamera();
              if (uri) {
                onImageSelected(uri);
              }
            },
          },
          { text: t('common:button.cancel'), style: 'cancel' },
        ],
      );
    },
    [pickFromCamera, pickFromGallery, t],
  );

  return { pickFromGallery, pickFromCamera, showImagePickerOptions };
};
