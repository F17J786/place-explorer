import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

const BATTERY_ASKED_KEY = 'placeexplorer_battery_asked';

export const requestBatteryOptimizationExemption = async () => {
  if (Platform.OS !== 'android') return;

  const asked = await AsyncStorage.getItem(BATTERY_ASKED_KEY);
  if (asked) return;

  await AsyncStorage.setItem(BATTERY_ASKED_KEY, 'true');

  Alert.alert(
    i18n.t('common:batteryPermission.title'),
    i18n.t('common:batteryPermission.message'),
    [
      { text: i18n.t('common:batteryPermission.later'), style: 'cancel' },
      {
        text: i18n.t('common:batteryPermission.openSettings'),
        onPress: () => Linking.openSettings(),
      },
    ],
  );
};
