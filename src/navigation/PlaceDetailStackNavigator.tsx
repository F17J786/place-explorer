import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PlaceDetailScreen,
  CheckinListScreen,
  ReviewListScreen,
  createScreenOptions,
  ProfileReviewScreen,
} from '@/screens/PlaceDetail';

const DetailStack = createNativeStackNavigator();

export const PlaceDetailStackNavigator = () => {
  return (
    <DetailStack.Navigator screenOptions={{ headerShown: false }}>
      <DetailStack.Screen
        name="PlaceDetailHome"
        component={PlaceDetailScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Chi tiết địa điểm' })
        }
      />
      <DetailStack.Screen
        name="CheckinList"
        component={CheckinListScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Danh sách check in' })
        }
      />
      <DetailStack.Screen
        name="ReviewList"
        component={ReviewListScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Danh sách đánh giá' })
        }
      />
      <DetailStack.Screen
        name="ProfileReview"
        component={ProfileReviewScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Trang cá nhân' })
        }
      />
    </DetailStack.Navigator>
  );
};
