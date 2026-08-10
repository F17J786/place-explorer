import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { ThemeColors } from '@/theme/colors';

interface ScreenHeaderOptions {
  navigation: any;
  title: string;
  headerRight?: () => React.ReactNode;
  colors: ThemeColors;
}

const STATUSBAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export const createScreenOptions = ({
  navigation,
  title,
  headerRight,
  colors,
}: ScreenHeaderOptions): NativeStackNavigationOptions => {
  const styles = createStyles(colors);

  return {
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
          <Icon name="chevron-left" size={20} color={colors.iconMuted} />
        </View>
      </TouchableOpacity>
    ),
    ...(headerRight && { headerRight }),
  };
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerBg: {
      flex: 1,
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      shadowColor: colors.surface,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 3,
    },
    titleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
      marginTop: STATUSBAR_HEIGHT + 14,
      marginBottom: 14,
    },
    titleText: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.headerTitleText,
    },
    backBtn: {
      marginLeft: Platform.OS === 'ios' ? 4 : 0,
      marginTop: STATUSBAR_HEIGHT + 14,
      marginBottom: 14,
    },
    backIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: colors.backBtnBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
