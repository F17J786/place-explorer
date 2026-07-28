import { useCallback, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/utils/toast';

export const useMyLocation = () => {
  const { t } = useTranslation('map');
  const [locationPermission, setLocationPermission] = useState(false);
  const [myLocationCoord, setMyLocationCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const ok =
      result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
    if (ok) setLocationPermission(true);
    return ok;
  }, []);

  const getMyCoord = useCallback((): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        pos => {
          const c = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setMyLocationCoord(c);
          resolve(c);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }, []);

  const requestPermAndGetCoord = useCallback(async () => {
    let hasPerm = locationPermission;
    if (!hasPerm) {
      hasPerm = await requestPermission();
    }
    if (!hasPerm) {
      showToast(t('common:location.notAvailable'));
      return null;
    }

    try {
      await promptForEnableLocationIfNeeded();
    } catch {
      showToast(t('common:location.notAvailable'));
      return null;
    }

    if (myLocationCoord) return myLocationCoord;

    setLocating(true);
    const coord = await getMyCoord();
    setLocating(false);
    return coord;
  }, [locationPermission, myLocationCoord, getMyCoord, requestPermission, t]);

  const startTracking = useCallback(
    async (
      onSuccess: (coord: { latitude: number; longitude: number }) => void,
    ) => {
      try {
        const ok = await requestPermission();
        if (!ok) return;

        try {
          await promptForEnableLocationIfNeeded();
        } catch {
          showToast(t('common:location.notAvailable'));
          return;
        }

        setLocating(true);
        Geolocation.getCurrentPosition(
          pos => {
            const coord = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            setMyLocationCoord(coord);
            setLocating(false);
            onSuccess(coord);
          },
          err => {
            console.log('GPS error:', err);
            showToast(t('location.gpsError'));
            setLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } catch (e) {
        console.warn(e);
        setLocating(false);
      }
    },
    [requestPermission, t],
  );

  return {
    locationPermission,
    myLocationCoord,
    locating,
    startTracking,
    requestPermAndGetCoord,
  };
};
