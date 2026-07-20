import { useCallback, useState } from 'react';
import { Alert, PermissionsAndroid } from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import {
  useCreateCheckinMutation,
  useGetCheckinsByOsmIdQuery,
  useUpsertPlaceMutation,
} from '@/store/api/placeDetailApi';
import type { OsmMarker } from '@/types/mapScreen.type';
import type { User } from '@/types/user';
import { showToast } from '@/utils/toast';
import {
  CHECKIN_COOLDOWN_MS,
  CHECKIN_MAX_DISTANCE_METERS,
  EARTH_RADIUS_METERS,
  GEOLOCATION_OPTIONS,
} from '@/constants/constants';

type UseCheckinActionParams = {
  isLoggedIn: boolean;
  user: User | null | undefined;
  osmId: string;
  place: OsmMarker;
  amenityLabel: string;
};

const getDistanceMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useCheckinAction = ({
  isLoggedIn,
  user,
  osmId,
  place,
  amenityLabel,
}: UseCheckinActionParams) => {
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [createCheckin] = useCreateCheckinMutation();
  const { data: checkins = [] } = useGetCheckinsByOsmIdQuery(osmId);
  const [upsertPlace] = useUpsertPlaceMutation();

  const handleCheckin = useCallback(async () => {
    if (!isLoggedIn || !user) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để check-in.');
      return;
    }

    await upsertPlace({
      osmId,
      osmType: 'node',
      name: place.name,
      category: amenityLabel,
      lat: place.coordinate.latitude,
      lng: place.coordinate.longitude,
      address: place.address ?? '',
      thumbnailUrl: place.photoUrl ?? '',
    });

    setCheckinLoading(true);

    const myLastCheckin = checkins.find(
      c => String(c.userId) === String(user.id),
    );
    if (myLastCheckin) {
      const elapsed = Date.now() - new Date(myLastCheckin.createdAt).getTime();
      if (elapsed < CHECKIN_COOLDOWN_MS) {
        const remainingMin = Math.ceil((CHECKIN_COOLDOWN_MS - elapsed) / 60000);
        Alert.alert(
          'Chưa thể check-in',
          `Bạn vừa check-in tại đây. Thử lại sau ${remainingMin} phút.`,
        );
        setCheckinLoading(false);
        return;
      }
    }

    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const granted =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!granted) {
        setCheckinLoading(false);
        return;
      }

      try {
        await promptForEnableLocationIfNeeded();
      } catch {
        showToast('Chưa có vị trí hiện tại. Thử lại');
        setCheckinLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        async pos => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          const distance = getDistanceMeters(
            place.coordinate.latitude,
            place.coordinate.longitude,
            userLat,
            userLng,
          );

          if (distance > CHECKIN_MAX_DISTANCE_METERS) {
            Alert.alert(
              'Quá xa',
              `Bạn đang cách ${Math.round(
                distance,
              )}m. Cần trong phạm vi 100m để check-in.`,
            );
            setCheckinLoading(false);
            return;
          }

          await createCheckin({
            userId: user.id,
            osmId,
            lat: userLat,
            lng: userLng,
            distanceMeters: Math.round(distance * 10) / 10,
            createdAt: new Date().toISOString(),
          });

          Alert.alert(
            'Check-in thành công!',
            `Bạn đã check-in tại ${place.name}`,
          );
          setCheckinLoading(false);
        },
        err => {
          Alert.alert(
            'Lỗi vị trí',
            'Không thể lấy vị trí. Kiểm tra quyền GPS.',
          );
          setCheckinLoading(false);
          console.warn(err);
        },
        GEOLOCATION_OPTIONS,
      );
    } catch {
      setCheckinLoading(false);
    }
  }, [
    isLoggedIn,
    user,
    osmId,
    place,
    amenityLabel,
    createCheckin,
    upsertPlace,
    checkins,
  ]);

  return { checkinLoading, handleCheckin };
};
