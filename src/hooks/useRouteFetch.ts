import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { fetchRouteDetails, OrsProfile } from '@/store/api/osrm';
import { showToast } from '@/utils/toast';
import { loadTravelMode, saveTravelMode } from '@/storage/routeTravelMode';
import { RoutePoint } from '@/types/mapScreen.type';
import {
  RouteModeActiveIndex,
  RouteModeLoading,
  RouteModeResults,
  TravelMode,
} from '@/types/route.type';

const PROFILE_BY_MODE: Record<TravelMode, OrsProfile> = {
  driving: 'driving-car',
  motorcycle: 'cycling-regular',
  walking: 'foot-walking',
};

const MODES: TravelMode[] = ['driving', 'motorcycle', 'walking'];

const EMPTY_RESULTS: RouteModeResults = {
  driving: null,
  motorcycle: null,
  walking: null,
};

const EMPTY_LOADING: RouteModeLoading = {
  driving: false,
  motorcycle: false,
  walking: false,
};

const EMPTY_ACTIVE_INDEX: RouteModeActiveIndex = {
  driving: 0,
  motorcycle: 0,
  walking: 0,
};

export const useRouteFetch = (
  pointA: RoutePoint | null,
  pointB: RoutePoint | null,
  mapRef: React.RefObject<MapView | null>,
) => {
  const { t } = useTranslation('map');
  const [selectedMode, setSelectedModeState] = useState<TravelMode>('driving');
  const [routesByMode, setRoutesByMode] =
    useState<RouteModeResults>(EMPTY_RESULTS);
  const [modesLoading, setModesLoading] =
    useState<RouteModeLoading>(EMPTY_LOADING);
  const [activeIndexByMode, setActiveIndexByMode] =
    useState<RouteModeActiveIndex>(EMPTY_ACTIVE_INDEX);
  const [routeGeneration, setRouteGeneration] = useState(0);

  const requestIdRef = useRef(0);
  const selectedModeRef = useRef<TravelMode>('driving');

  useEffect(() => {
    selectedModeRef.current = selectedMode;
  }, [selectedMode]);

  useEffect(() => {
    loadTravelMode().then(saved => {
      if (saved) setSelectedModeState(saved);
    });
  }, []);

  const setSelectedMode = useCallback((mode: TravelMode) => {
    setSelectedModeState(mode);
    saveTravelMode(mode);
  }, []);

  const setActiveRouteIndex = useCallback((mode: TravelMode, index: number) => {
    setActiveIndexByMode(prev => ({ ...prev, [mode]: index }));
  }, []);

  const doFetchAll = useCallback(async () => {
    if (!pointA || !pointB) return;

    const requestId = ++requestIdRef.current;
    setRoutesByMode(EMPTY_RESULTS);
    setModesLoading({ driving: true, motorcycle: true, walking: true });
    setActiveIndexByMode(EMPTY_ACTIVE_INDEX);

    await Promise.all(
      MODES.map(async mode => {
        const result = await fetchRouteDetails(
          pointA.coordinate,
          pointB.coordinate,
          PROFILE_BY_MODE[mode],
        );
        if (requestId !== requestIdRef.current) return;

        setRoutesByMode(prev => ({ ...prev, [mode]: result }));
        setModesLoading(prev => ({ ...prev, [mode]: false }));
        setActiveIndexByMode(prev => ({ ...prev, [mode]: 0 }));

        if (!result && mode === selectedModeRef.current) {
          showToast(t('routeFetch.notFound'));
        }
      }),
    );
  }, [pointA, pointB, t]);

  useEffect(() => {
    if (pointA && pointB) doFetchAll();
    else {
      requestIdRef.current += 1;
      setRoutesByMode(EMPTY_RESULTS);
      setModesLoading(EMPTY_LOADING);
      setActiveIndexByMode(EMPTY_ACTIVE_INDEX);
    }
  }, [pointA, pointB]);

  const activeAlternatives = routesByMode[selectedMode];
  const activeIndex = activeIndexByMode[selectedMode];
  const activeResult = activeAlternatives?.[activeIndex] ?? null;

  useEffect(() => {
    if (!activeResult || activeResult.coords.length === 0) return;
    mapRef.current?.fitToCoordinates(activeResult.coords, {
      edgePadding: { top: 80, right: 40, bottom: 340, left: 40 },
      animated: true,
    });
  }, [activeResult, mapRef]);

  const clearRoute = useCallback(() => {
    requestIdRef.current += 1;
    setRoutesByMode(EMPTY_RESULTS);
    setModesLoading(EMPTY_LOADING);
    setActiveIndexByMode(EMPTY_ACTIVE_INDEX);
    setRouteGeneration(g => g + 1);
  }, []);

  return {
    routeCoords: activeResult?.coords ?? [],
    routeLoading: modesLoading[selectedMode],
    routeGeneration,
    clearRoute,
    selectedMode,
    setSelectedMode,
    routesByMode,
    modesLoading,
    activeIndexByMode,
    setActiveRouteIndex,
    activeAlternatives,
    activeIndex,
  };
};
