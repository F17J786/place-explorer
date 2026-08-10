import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { usePlaceDetailScreenStyles } from '@/hooks/usePlaceDetailScreenStyles';

type ActionButtonsProps = {
  isLoggedIn: boolean;
  isFavorited: boolean;
  checkinLoading: boolean;
  onSearchRoute: () => void;
  onCheckin: () => void;
  onToggleFavorite: () => void;
};

export const ActionButtons = ({
  isLoggedIn,
  isFavorited,
  checkinLoading,
  onSearchRoute,
  onCheckin,
  onToggleFavorite,
}: ActionButtonsProps) => {
  const { styles, colors } = usePlaceDetailScreenStyles();
  const { t } = useTranslation('placeDetail');

  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnOutline]}
        onPress={onSearchRoute}
      >
        <Icon name="directions" size={18} color={colors.primary} />
        <Text style={styles.actionBtnOutlineText}>
          {t('actions.directions')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.actionBtnPrimary,
          (!isLoggedIn || checkinLoading) && styles.actionBtnDisabled,
        ]}
        onPress={onCheckin}
        disabled={!isLoggedIn || checkinLoading}
      >
        {checkinLoading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            <Icon2 name="map-marker-check" size={18} color={colors.white} />
            <Text style={styles.actionBtnPrimaryText}>
              {t('actions.checkin')}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          styles.actionBtnOutline,
          styles.actionBtnIcon,
        ]}
        onPress={onToggleFavorite}
      >
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};
