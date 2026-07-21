import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
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

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
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
});

export default App;
