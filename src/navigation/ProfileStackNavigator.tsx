import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ProfileScreen,
  PersonalInfoScreen,
  ChangePasswordScreen,
} from '@/screens/Profile';
import { createScreenOptions } from '@/screens/PlaceDetail';
import { useTranslation } from 'react-i18next';

const ProfileStack = createNativeStackNavigator();

export const ProfileStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('profile:menu.personalInfo'),
          })
        }
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) =>
          createScreenOptions({
            navigation,
            title: t('profile:menu.changePassword'),
          })
        }
      />
    </ProfileStack.Navigator>
  );
};
