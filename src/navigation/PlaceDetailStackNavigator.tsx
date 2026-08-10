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
import { useTheme } from '@/theme/ThemeContext';

const DetailStack = createNativeStackNavigator();

export const PlaceDetailStackNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <DetailStack.Navigator screenOptions={{ headerShown: false }}>
      <DetailStack.Screen
        name="PlaceDetailHome"
        component={PlaceDetailScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('placeDetail:navTitle.detail'),
            colors,
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
            colors,
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
            colors,
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
            colors,
          })
        }
      />
    </DetailStack.Navigator>
  );
};
