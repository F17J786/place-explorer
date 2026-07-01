import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ProfileScreen,
  PersonalInfoScreen,
  ChangePasswordScreen,
} from '@/screens/Profile';
import { createScreenOptions } from '@/screens/PlaceDetail';

const ProfileStack = createNativeStackNavigator();

export const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Thông tin cá nhân' })
        }
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) =>
          createScreenOptions({ navigation, title: 'Đổi mật khẩu' })
        }
      />
    </ProfileStack.Navigator>
  );
};
