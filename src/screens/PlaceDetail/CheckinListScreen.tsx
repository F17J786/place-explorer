import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetCheckinsByOsmIdQuery } from '@/store/api/placeDetailApi';
import type { Checkin } from '@/types/placeDetail.types';
import { PlaceDetailStackParamList } from '@/types/navigation';

const COLORS = {
  primary: '#1A56DB',
  primaryLight: '#EBF0FF',
  white: '#FFFFFF',
  bg: '#F5F6FA',
  text: '#0F172A',
  textSub: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  cardShadow: 'rgba(26,86,219,0.08)',
};

type RoutePropType = RouteProp<PlaceDetailStackParamList, 'CheckinList'>;
type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'CheckinList'
>;

const Avatar = ({ uri, size = 40 }: { uri?: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.primaryLight,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: COLORS.border,
    }}
  >
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} />
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="person" size={size * 0.55} color={COLORS.primary} />
      </View>
    )}
  </View>
);

const CheckinItem = ({ item }: { item: Checkin }) => (
  <View style={styles.card}>
    <Avatar uri={item.user?.avatar} size={44} />
    <View style={styles.cardContent}>
      <Text style={styles.userName}>
        {item.user?.name ?? 'Người dùng ẩn danh'}
      </Text>
      <View style={styles.metaRow}>
        <Icon name="access-time" size={12} color={COLORS.textLight} />
        <Text style={styles.metaText}>
          {new Date(item.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name="location-on" size={12} color={COLORS.primary} />
        <Text style={styles.distanceText}>Cách {item.distanceMeters}m</Text>
      </View>
    </View>
    <View style={styles.badge}>
      <Icon2 name="map-marker-check" size={18} color={COLORS.success} />
    </View>
  </View>
);
export const CheckinListScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavProp>();
  const { osmId, placeName } = route.params;

  const { data: checkins = [], isLoading } = useGetCheckinsByOsmIdQuery(osmId);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={{ marginTop: 60 }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 48,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 4,
  },
  backBtn: { padding: 9 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  list: { padding: 14, gap: 10 },
  listCount: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  cardContent: { flex: 1, gap: 3 },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textLight },
  distanceText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8FFF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textSub },
});
