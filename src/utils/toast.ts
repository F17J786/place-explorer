import { Platform, ToastAndroid } from 'react-native';
import { toast } from '@baronha/ting';

export const showToast = (msg: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
    return;
  }

  toast({
    title: msg,
    preset: 'none',
    duration: 2,
    position: 'bottom',
    backgroundColor: '#FFFFFF',
    titleColor: '#1A1A1A',
  });
};
