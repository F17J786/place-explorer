import React, { useCallback } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { StatusBar, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';

import { RootNavigator } from '@/navigation/RootNavigator';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/types';
import type { RootState } from '@/store';
import { useBootstrap } from '@/hooks/useBootstrap';

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
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { isReady } = useBootstrap();

  const handleReady = useCallback(() => {
    applyStatusBarForRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const handleStateChange = useCallback(() => {
    applyStatusBarForRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const linking = {
    prefixes: ['myapptest://', 'https://f17j786.github.io'],
    config: {
      screens: {
        Main: {
          screens: {
            Map: {
              screens: {
                MapScreen: 'place/:osmId',
              },
            },
          },
        },
        Auth: 'auth',
      },
    },
    getStateFromPath: (path: string, options: any) => {
      const state = require('@react-navigation/native').getStateFromPath(
        path,
        options,
      );
      const cleanPath = path.replace(/^\//, '');

      if (cleanPath.startsWith('place/')) {
        const [pathPart, query] = cleanPath.split('?');
        const searchParams = new URLSearchParams(query ?? '');
        const osmId = pathPart.split('/')[1];
        const lat = Number(searchParams.get('lat')) || 0;
        const lng = Number(searchParams.get('lng')) || 0;

        const selectedMarker = {
          osmId,
          osmType: searchParams.get('osmType') ?? 'node',
          name: searchParams.get('name') ?? '',
          amenity: searchParams.get('amenity') ?? '',
          lat,
          lng,
          address: searchParams.get('address') ?? '',
          thumbnailUrl: searchParams.get('thumbnailUrl') ?? '',
          coordinate: { latitude: lat, longitude: lng },
        };

        const redirectTo = {
          screen: 'Main',
          params: {
            screen: 'Map',
            params: {
              screen: 'MapScreen',
              params: { selectedMarker, navKey: Date.now() },
            },
          },
        };

        if (!isLoggedIn) {
          return { routes: [{ name: 'Auth', params: { redirectTo } }] };
        }

        return {
          routes: [{ name: redirectTo.screen, params: redirectTo.params }],
        };
      }

      return state;
    },
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={handleReady}
      onStateChange={handleStateChange}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};
