import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Text,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapType, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import {
  COLORS,
  INITIAL_REGION,
  MAX_ZOOM,
  MIN_ZOOM,
} from '@/constants/constants';
import { OsmMarker } from '@/types/mapScreen.type';
import { loadLastRegion } from '@/storage/lastRegion';

import { useMapMarkers } from '@/hooks/useMapMarkers';
import { useMyLocation } from '@/hooks/useMyLocation';
import { useSearch } from '@/hooks/useSearch';
import { useRouteInputs } from '@/hooks/useRouteInputs';
import { useRouteFetch } from '@/hooks/useRouteFetch';

import { MarkerItem } from '@/components/map/MarkerItem';
import { RouteMarker } from '@/components/map/RouteMarker';
import { SearchBar } from '@/components/map/SearchBar';
import { FilterChips } from '@/components/map/FilterChips';
import { RoutePanel } from '@/components/map/RoutePanel';
import { RightActions } from '@/components/map/RightActions';
import { MarkerPopup } from '@/components/map/MarkerPopup';
import { PlaceListSheet } from '@/components/map/PlaceListSheet';
import { useMapScreenStyles } from '@/hooks/useMapScreenStyles';
import { useTheme } from '@/theme/ThemeContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RouteResultSheet } from '@/components/map/RouteResultSheet';
import { MAX_ALTERNATIVES } from '@/store/api/osrm';

interface MapScreenProps {
  navigation?: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { t } = useTranslation('map');
  const mapRef = useRef<MapView>(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const routeResultSheetRef = useRef<BottomSheetModal>(null);
  const { styles, isDark } = useMapScreenStyles();
  const { colors } = useTheme();
  console.log('[MapScreen] isDark:', isDark);

  const [mapType, setMapType] = useState<MapType>('standard');
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<OsmMarker | null>(null);
  const [initialRegion, setInitialRegion] = useState(INITIAL_REGION);

  const {
    markers,
    sortedRef,
    loading,
    error,
    lastRegion,
    loadMarkers,
    onRegionChangeComplete,
  } = useMapMarkers(selectedAmenity);

  const { locating, startTracking, requestPermAndGetCoord } = useMyLocation();

  const search = useSearch(mapRef, sortedRef);

  const routeInputs = useRouteInputs({ sortedRef, requestPermAndGetCoord });
  const {
    routeCoords,
    routeLoading,
    clearRoute,
    selectedMode,
    setSelectedMode,
    routesByMode,
    modesLoading,
    activeIndexByMode,
    setActiveRouteIndex,
    activeAlternatives,
    activeIndex,
    routeGeneration,
  } = useRouteFetch(routeInputs.pointA, routeInputs.pointB, mapRef);

  const route = useRoute();
  const routeParams = route.params as
    | { routeTo?: OsmMarker; selectedMarker?: OsmMarker; navKey?: number }
    | undefined;

  useEffect(() => {
    if (!routeParams?.routeTo) return;
    routeInputs.openRouteToPlace(routeParams.routeTo);
  }, [routeParams?.routeTo]);

  console.log(
    '[MapScreen render] navKey:',
    routeParams?.navKey,
    'selectedMarker:',
    routeParams?.selectedMarker,
  );

  useEffect(() => {
    const marker = routeParams?.selectedMarker;
    if (!marker) return;
    setSelectedMarker(marker);

    const timer = setTimeout(() => {
      mapRef.current?.animateCamera({ center: marker.coordinate, zoom: 19 });
    }, 350);

    return () => clearTimeout(timer);
  }, [routeParams?.selectedMarker]);

  useEffect(() => {
    loadLastRegion().then(r => {
      if (r) setInitialRegion(r);
    });
  }, []);

  const hasPresentedRouteSheetRef = useRef(false);

  useEffect(() => {
    if (routeCoords.length === 0) {
      hasPresentedRouteSheetRef.current = false;
      return;
    }

    if (hasPresentedRouteSheetRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      routeResultSheetRef.current?.present();
      hasPresentedRouteSheetRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [routeCoords]);

  useEffect(() => {
    Animated.spring(popupAnim, {
      toValue: selectedMarker ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [selectedMarker, popupAnim]);

  const zoom = async (delta: 1 | -1) => {
    try {
      const cam = await mapRef.current?.getCamera();
      if (!cam || cam.zoom == null) return;
      const next = Math.min(Math.max(cam.zoom + delta, MIN_ZOOM), MAX_ZOOM);
      mapRef.current?.animateCamera({ ...cam, zoom: next }, { duration: 300 });
    } catch {}
  };

  const handleRegionChangeComplete = (r: any) => {
    onRegionChangeComplete(r);
    setInitialRegion(r);

    if (!mapRef.current) return;
    mapRef.current
      .getCamera()
      .then(cam => {
        if (cam?.zoom != null) setCurrentZoom(cam.zoom);
      })
      .catch(() => {});
  };

  const closeRoutePanel = () => {
    routeInputs.setRouteMode(false);
    routeInputs.resetRoute();
    clearRoute();
    routeResultSheetRef.current?.dismiss();
  };

  const visibleMarkers = useMemo(() => {
    if (!lastRegion) return [];
    const { latitude, longitude, latitudeDelta, longitudeDelta } = lastRegion;
    const inView = sortedRef.current.filter(
      m =>
        m.coordinate.latitude >= latitude - latitudeDelta / 2 &&
        m.coordinate.latitude <= latitude + latitudeDelta / 2 &&
        m.coordinate.longitude >= longitude - longitudeDelta / 2 &&
        m.coordinate.longitude <= longitude + longitudeDelta / 2 &&
        (selectedAmenity === '' || m.amenity === selectedAmenity) &&
        m.name !== 'Không tên',
    );
    const limit = Math.round(0.5 / latitudeDelta);
    return inView.slice(0, limit);
  }, [markers, lastRegion, selectedAmenity]);

  const mapMarkersToRender = visibleMarkers.filter(item => {
    const near = (pt: typeof routeInputs.pointA) => {
      if (!pt) return false;
      return (
        Math.abs(item.coordinate.latitude - pt.coordinate.latitude) < 0.0001 &&
        Math.abs(item.coordinate.longitude - pt.coordinate.longitude) < 0.0001
      );
    };
    return !near(routeInputs.pointA) && !near(routeInputs.pointB);
  });

  console.log(
    '[MapView render]',
    new Date().toISOString(),
    'isDark:',
    isDark,
    'style:',
    isDark ? 'DARK' : 'LIGHT',
  );

  return (
    <View style={styles.container}>
      <MapView
        key={isDark ? 'map-dark' : 'map-light'}
        ref={mapRef}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType={mapType}
        showsUserLocation
        onPress={() => {
          setSelectedMarker(null);
          Keyboard.dismiss();
        }}
      >
        {mapMarkersToRender.map(item => (
          <MarkerItem
            key={item.id}
            item={item}
            selected={selectedMarker?.id === item.id}
            onPress={m => setSelectedMarker(m)}
          />
        ))}

        {Array.from({ length: MAX_ALTERNATIVES }).map((_, index) => {
          const alt = activeAlternatives?.[index];
          const isActive = index === activeIndex;
          const coords = alt && !isActive ? alt.coords : [];

          return (
            <React.Fragment key={`route-alt-${index}`}>
              <Polyline
                coordinates={coords}
                strokeColor={colors.routeInactiveBorder}
                strokeWidth={8}
                lineCap="round"
                lineJoin="round"
                zIndex={1}
              />
              <Polyline
                coordinates={coords}
                strokeColor={colors.routeInactive}
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
                tappable
                zIndex={2}
                onPress={() => setActiveRouteIndex(selectedMode, index)}
              />
            </React.Fragment>
          );
        })}

        <Polyline
          coordinates={routeCoords}
          strokeColor={colors.routeActiveBorder}
          strokeWidth={9}
          lineCap="round"
          lineJoin="round"
          zIndex={3}
        />
        <Polyline
          coordinates={routeCoords}
          strokeColor={colors.routeActive}
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
          zIndex={4}
        />

        {routeInputs.pointA && (
          <RouteMarker coordinate={routeInputs.pointA.coordinate} label="A" />
        )}
        {routeInputs.pointB && (
          <RouteMarker coordinate={routeInputs.pointB.coordinate} label="B" />
        )}
      </MapView>

      {(loading || locating) && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {locating ? t('status.locating') : t('status.loadingPlaces')}
          </Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.hintBadge}>
          <Icon name="info-outline" size={14} color={COLORS.warning} />
          <Text style={styles.hintText}>{error}</Text>
        </View>
      )}

      {!routeInputs.routeMode ? (
        <SearchBar
          searchQuery={search.searchQuery}
          searchFocused={search.searchFocused}
          suggestions={search.suggestions}
          searchLoading={search.searchLoading}
          resultCount={visibleMarkers.length}
          onChangeText={search.onSearchChange}
          onFocus={() => search.setSearchFocused(true)}
          onBlur={() => setTimeout(() => search.setSearchFocused(false), 200)}
          onClear={search.clearSearch}
          onSelectSuggestion={search.onSelectSuggestion}
          onOpenRoutePanel={() => {
            routeInputs.setRouteMode(true);
            setSelectedMarker(null);
            Keyboard.dismiss();
          }}
        />
      ) : (
        <RoutePanel
          focusedInput={routeInputs.focusedInput}
          displayA={routeInputs.displayA}
          displayB={routeInputs.displayB}
          inputAText={routeInputs.inputAText}
          inputBText={routeInputs.inputBText}
          inputAIsMyLoc={routeInputs.inputAIsMyLoc}
          inputBIsMyLoc={routeInputs.inputBIsMyLoc}
          inputAFocusHide={routeInputs.inputAFocusHide}
          inputBFocusHide={routeInputs.inputBFocusHide}
          isTyping={routeInputs.isTyping}
          routeCoordsEmpty={routeCoords.length === 0}
          showRouteDropdownBase={routeInputs.showRouteDropdownBase}
          showSearchResults={routeInputs.showSearchResults}
          routeSuggestions={routeInputs.routeSuggestions}
          routeSuggestLoading={routeInputs.routeSuggestLoading}
          recentPoints={routeInputs.recentPoints}
          routeLoading={routeLoading}
          locating={locating}
          onClosePanel={closeRoutePanel}
          onInputFocus={routeInputs.onInputFocus}
          onInputBlur={routeInputs.onInputBlur}
          onInputChange={routeInputs.onInputChange}
          onClearInputA={() => {
            routeInputs.clearInputA();
          }}
          onClearInputB={() => {
            routeInputs.clearInputB();
          }}
          onSwap={routeInputs.swapPoints}
          onSelectSearchResult={routeInputs.handleSelectSearchResult}
          onSelectRecent={routeInputs.handleSelectRecent}
          onSelectMyLocation={routeInputs.handleSelectMyLocation}
        />
      )}

      {!routeInputs.routeMode && (
        <FilterChips
          selectedAmenity={selectedAmenity}
          onToggle={key =>
            setSelectedAmenity(prev => (prev === key ? '' : key))
          }
        />
      )}

      <RightActions
        currentZoom={currentZoom}
        mapType={mapType}
        onZoomIn={() => zoom(1)}
        onZoomOut={() => zoom(-1)}
        onMyLocation={() =>
          startTracking(coord =>
            mapRef.current?.animateCamera({ center: coord, zoom: 16 }),
          )
        }
        onToggleMapType={() =>
          setMapType(t => (t === 'standard' ? 'satellite' : 'standard'))
        }
        onRefresh={() => lastRegion && loadMarkers(lastRegion)}
      />

      <MarkerPopup
        selectedMarker={selectedMarker}
        popupAnim={popupAnim}
        onClose={() => setSelectedMarker(null)}
        onDetail={() =>
          navigation?.navigate('PlaceDetail', {
            screen: 'PlaceDetailHome',
            params: { place: selectedMarker },
          })
        }
        onRoute={() => {
          if (!selectedMarker) return;
          routeInputs.openRouteToPlace(selectedMarker);
          setSelectedMarker(null);
        }}
      />

      {!routeInputs.routeMode && !selectedMarker && (
        <PlaceListSheet
          markers={visibleMarkers}
          loading={loading}
          selectedAmenity={selectedAmenity}
          onSelectMarker={item => {
            setSelectedMarker(item);
            mapRef.current?.animateCamera({
              center: item.coordinate,
              zoom: 19,
            });
          }}
        />
      )}

      <RouteResultSheet
        ref={routeResultSheetRef}
        pointA={routeInputs.pointA}
        pointB={routeInputs.pointB}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        routesByMode={routesByMode}
        modesLoading={modesLoading}
        activeIndexByMode={activeIndexByMode}
        onSelectAlternative={setActiveRouteIndex}
        onClose={closeRoutePanel}
      />
    </View>
  );
};

export default MapScreen;
