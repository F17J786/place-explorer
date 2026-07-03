import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from '@/navigation/MainTabNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { AuthScreen } from '@/screens/Auth';
import { PlaceDetailStackNavigator } from './PlaceDetailStackNavigator';
import { useAppSelector } from '@/store/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="PlaceDetail"
            component={PlaceDetailStackNavigator}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};
