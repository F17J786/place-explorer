import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import {
  PlaceDetailScreen,
  CheckinListScreen,
  ReviewListScreen,
  createScreenOptions,
  ProfileReviewScreen,
} from '@/screens/PlaceDetail';

const DetailStack = createNativeStackNavigator();

export const PlaceDetailStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <DetailStack.Navigator screenOptions={{ headerShown: false }}>
      <DetailStack.Screen
        name="PlaceDetailHome"
        component={PlaceDetailScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('placeDetail:navTitle.detail'),
          })
        }
      />
      <DetailStack.Screen
        name="CheckinList"
        component={CheckinListScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('checkin:navTitle'),
          })
        }
      />
      <DetailStack.Screen
        name="ReviewList"
        component={ReviewListScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('review:navTitle'),
          })
        }
      />
      <DetailStack.Screen
        name="ProfileReview"
        component={ProfileReviewScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('profileReview:navTitle'),
          })
        }
      />
    </DetailStack.Navigator>
  );
};
