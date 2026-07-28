import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { fetchRoute } from '@/store/api/osrm';
import { showToast } from '@/utils/toast';
import { RoutePoint } from '@/types/mapScreen.type';

export const useRouteFetch = (
  pointA: RoutePoint | null,
  pointB: RoutePoint | null,
  mapRef: React.RefObject<MapView | null>,
) => {
  const { t } = useTranslation('map');
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const routeCancelRef = useRef(false);

  const doFetchRoute = useCallback(async () => {
    if (!pointA || !pointB) return;

    routeCancelRef.current = false;
    setRouteLoading(true);
    setRouteCoords([]);
    const coords = await fetchRoute(pointA.coordinate, pointB.coordinate);
    setRouteLoading(false);
    if (routeCancelRef.current) return;

    if (coords.length === 0) {
      showToast(t('routeFetch.notFound'));
      return;
    }

    setRouteCoords(coords);
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 340, left: 40 },
      animated: true,
    });
  }, [pointA, pointB, mapRef, t]);

  useEffect(() => {
    if (pointA && pointB) doFetchRoute();
    else setRouteCoords([]);
  }, [pointA, pointB]);

  const clearRoute = useCallback(() => {
    routeCancelRef.current = true;
    setRouteLoading(false);
    setRouteCoords([]);
  }, []);

  return { routeCoords, routeLoading, clearRoute };
};
