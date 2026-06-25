import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PlaceDetailScreen,
  CheckinListScreen,
  ReviewListScreen,
} from '@/screens/PlaceDetail';

const DetailStack = createNativeStackNavigator();

export const PlaceDetailStackNavigator = () => {
  return (
    <DetailStack.Navigator screenOptions={{ headerShown: false }}>
      <DetailStack.Screen
        name="PlaceDetailHome"
        component={PlaceDetailScreen}
      />
      <DetailStack.Screen name="CheckinList" component={CheckinListScreen} />
      <DetailStack.Screen name="ReviewList" component={ReviewListScreen} />
    </DetailStack.Navigator>
  );
};
