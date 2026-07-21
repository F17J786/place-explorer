import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BATTERY_ASKED_KEY = 'placeexplorer_battery_asked';

export const requestBatteryOptimizationExemption = async () => {
  if (Platform.OS !== 'android') return;

  const asked = await AsyncStorage.getItem(BATTERY_ASKED_KEY);
  if (asked) return;

  await AsyncStorage.setItem(BATTERY_ASKED_KEY, 'true');

  Alert.alert(
    'Cần cấp quyền chạy nền',
    'Để PlaceExplorer đồng bộ dữ liệu khi mất mạng, vui lòng vào Pin → Không hạn chế để app hoạt động ổn định.',
    [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Mở Settings', onPress: () => Linking.openSettings() },
    ],
  );
};
