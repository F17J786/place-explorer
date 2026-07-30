import { NativeModules, Platform } from 'react-native';

const { KeyboardAdjust } = NativeModules;

export const setAdjustResize = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await KeyboardAdjust?.setAdjustResize();
  }
};

export const setAdjustPan = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await KeyboardAdjust?.setAdjustPan();
  }
};
