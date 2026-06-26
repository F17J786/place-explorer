import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

interface ScreenHeaderOptions {
  navigation: any;
  title: string;
  headerRight?: () => React.ReactNode;
}

export const createScreenOptions = ({
  navigation,
  title,
  headerRight,
}: ScreenHeaderOptions): NativeStackNavigationOptions => ({
  headerShown: true,
  headerShadowVisible: false,
  headerBackground: () => <View style={styles.headerBg} />,
  headerTitle: () => (
    <View style={styles.titleWrap}>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  ),
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.75}
      style={styles.backBtn}
    >
      <View style={styles.backIconWrap}>
        <Icon name="chevron-left" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  ),
  ...(headerRight && { headerRight }),
});

const styles = StyleSheet.create({
  headerBg: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginVertical: 14,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  backBtn: {
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
    marginVertical: 14,
  },
  backIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
