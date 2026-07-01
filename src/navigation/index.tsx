import React, { useCallback } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/types';

const LIGHT_STATUSBAR_SCREENS = ['Favorites', 'Profile', 'Auth'];

const applyStatusBarForRoute = (routeName?: string) => {
  if (routeName && LIGHT_STATUSBAR_SCREENS.includes(routeName)) {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(COLORS.primary);
  } else {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('transparent');
  }
};

export const AppNavigator = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  const handleReady = useCallback(() => {
    applyStatusBarForRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const handleStateChange = useCallback(() => {
    applyStatusBarForRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={handleReady}
      onStateChange={handleStateChange}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};
