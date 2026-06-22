import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Feather from 'react-native-vector-icons/Feather';

import { COLORS } from '@/constants/colors';
import { ProfileScreen } from '@/screens/Profile';
import type { MainTabParamList } from '@/navigation/types';
import { MapScreen } from '@/screens/Map';
import { FavoritesScreen } from '@/screens/Favorites';

const TABS = [
  { key: 'Map', label: 'Bản đồ', icon: 'map' },
  { key: 'Favorites', label: '', icon: 'heart', isFab: true },
  { key: 'Profile', label: 'Tài khoản', icon: 'user' },
] as const;

interface CustomTabBarProps {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { navigate: (name: string) => void };
}

const CustomTabBar = ({ state, navigation }: CustomTabBarProps) => {
  const activeIdx = state.index;

  return (
    <View style={tabBarStyles.wrapper}>
      <View style={tabBarStyles.bar}>
        {TABS.map((tab, idx) => {
          const isFab = 'isFab' in tab && tab.isFab;
          const isActive = !isFab && state.routes[activeIdx]?.name === tab.key;

          if (isFab) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={tabBarStyles.fabContainer}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(tab.key)}
                accessibilityLabel="Hỗ trợ"
                accessibilityRole="button"
              >
                <View style={tabBarStyles.fab}>
                  <Feather name={tab.icon} color="#fff" size={24} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={tabBarStyles.tabBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(tab.key)}
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Feather
                name={tab.icon}
                color={isActive ? COLORS.primary : COLORS.tabInactive}
                size={16}
              />
              <Text
                style={[
                  tabBarStyles.tabLabel,
                  { color: isActive ? COLORS.primary : COLORS.tabInactive },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    right: 20,
    borderRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'visible',
  },

  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    paddingHorizontal: 12,
  },

  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  fabContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: -45,
    paddingBottom: 0,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A56DB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#1A56DB',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: '#F3F4F8',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text
      style={{
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
      }}
    >
      Hỗ trợ
    </Text>
  </View>
);

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      {/* <Tab.Screen
        name="Support"
        component={PlaceholderScreen}
        options={{ title: 'Hỗ trợ' }}
      /> */}
      {/* <Tab.Screen
        name="Points"
        component={ProfileScreen}
        options={{ title: 'Điểm GD' }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};
