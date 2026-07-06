import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetCheckinsByOsmIdQuery } from '@/store/api/placeDetailApi';
import { CheckinItem } from '@/components/checkinlist/CheckinItem';
import { COLORS } from '@/constants/constantsCheckinListScreen';
import { styles } from '@/constants/stylesCheckinListScreen';
import { CheckinListRoutePropType } from '@/types/navigation';

export const CheckinListScreen = () => {
  const route = useRoute<CheckinListRoutePropType>();
  const { osmId } = route.params;

  const { data: checkins = [], isLoading } = useGetCheckinsByOsmIdQuery(osmId);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loadingIndicator}
        />
      ) : checkins.length === 0 ? (
        <View style={styles.empty}>
          <Icon2
            name="map-marker-off-outline"
            size={56}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyTitle}>Chưa có check-in nào</Text>
          <Text style={styles.emptyText}>
            Hãy là người đầu tiên check-in tại đây!
          </Text>
        </View>
      ) : (
        <FlatList
          data={checkins}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CheckinItem item={item} />}
          ListHeaderComponent={
            <Text style={styles.listCount}>
              {checkins.length} lượt check-in
            </Text>
          }
        />
      )}
    </View>
  );
};
