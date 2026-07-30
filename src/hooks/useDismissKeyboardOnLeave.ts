import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Fix bug: cục xám khi rời screen (bấm back, header back, hoặc gesture)
 * lúc TextInput đang focus, do native-stack (react-native-screens) pop
 * Fragment đồng thời với animation đóng keyboard trên Android.
 *
 * Dùng `beforeRemove` để bắt MỌI nguồn điều hướng rời screen (hardware
 * back, header back button, swipe-back gesture), không chỉ hardware back.
 *
 * Cách dùng: gọi 1 lần trong component có TextInput, ví dụ ReviewListScreen.
 */
export const useDismissKeyboardOnLeave = () => {
  const navigation = useNavigation();
  const isRetrying = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Nếu đang trong lần retry (đã dismiss keyboard rồi) thì cho đi tiếp
      if (isRetrying.current) {
        isRetrying.current = false;
        return;
      }

      if (Keyboard.isVisible()) {
        // Chặn hành động rời screen lần đầu
        e.preventDefault();
        Keyboard.dismiss();

        // Đợi keyboard đóng animation xong rồi mới thực hiện lại action gốc
        setTimeout(() => {
          isRetrying.current = true;
          navigation.dispatch(e.data.action);
        }, 100);
      }
      // Nếu keyboard không mở thì để action đi bình thường, không làm gì cả
    });

    return unsubscribe;
  }, [navigation]);
};
