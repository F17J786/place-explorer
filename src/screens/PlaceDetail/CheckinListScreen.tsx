import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useGetCheckinsByOsmIdQuery } from '@/store/api/placeDetailApi';
import { CheckinItem } from '@/components/checkinlist/CheckinItem';
import { useCheckinListScreenStyles } from '@/hooks/useCheckinListScreenStyles';
import { CheckinListRoutePropType } from '@/types/navigation';

export const CheckinListScreen = () => {
  const { t } = useTranslation('checkin');
  const route = useRoute<CheckinListRoutePropType>();
  const { osmId } = route.params;
  const { styles, colors } = useCheckinListScreenStyles();

  const { data: checkins = [], isLoading } = useGetCheckinsByOsmIdQuery(osmId);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={styles.loadingIndicator}
        />
      ) : checkins.length === 0 ? (
        <View style={styles.empty}>
          <Icon2
            name="map-marker-off-outline"
            size={56}
            color={colors.textLight}
          />
          <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
          <Text style={styles.emptyText}>{t('empty.subtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CheckinItem item={item} />}
          ListHeaderComponent={
            <Text style={styles.listCount}>
              {t('checkinCount', { count: checkins.length })}
            </Text>
          }
        />
      )}
    </View>
  );
};
