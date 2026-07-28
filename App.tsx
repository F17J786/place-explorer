import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';

import { AppNavigator } from '@/navigation';
import { store } from '@/store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NetworkProvider } from '@/provider/NetworkProvider';
import { requestBatteryOptimizationExemption } from '@/services/batteryPermission';
import { initBackgroundFetch } from '@/services/backgroundFetch';
import BackgroundFetch from 'react-native-background-fetch';
import initI18n from '@/locales/i18n';
import { COLORS } from '@/constants/constants';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch(err => {
        console.warn(
          '[App] i18n init failed, fallback to default language:',
          err,
        );
      })
      .finally(() => {
        setIsI18nReady(true);
      });
  }, []);

  useEffect(() => {
    const setup = async () => {
      await requestBatteryOptimizationExemption();
      await initBackgroundFetch();

      BackgroundFetch.status(status => {
        console.log('[BackgroundFetch] status:', status);
      });
    };

    setup();
  }, []);

  if (!isI18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <NetworkProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <BottomSheetModalProvider>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor="transparent"
                  translucent
                />
                <AppNavigator />
              </BottomSheetModalProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </NetworkProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
