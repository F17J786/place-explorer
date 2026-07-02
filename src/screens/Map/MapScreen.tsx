import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  PermissionsAndroid,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  Animated,
  StatusBar,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  MapType,
  Region,
  Polyline,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { toast } from '@baronha/ting';
import { useRoute } from '@react-navigation/native';

export const showToast = (msg: string) => {
  toast({
    title: msg,
    preset: 'none',
    duration: 2,
    position: 'bottom',
    backgroundColor: '#000000',
    titleColor: '#FFFFFF',
  });
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OsmMarker {
  id: string;
  name: string;
  amenity: string;
  score: number;
  coordinate: { latitude: number; longitude: number };
  photoUrl?: string;
  address?: string;
  tags?: Record<string, string>;
}

interface SearchSuggestion {
  id: string;
  name: string;
  displayName: string;
  coordinate: { latitude: number; longitude: number };
  type: 'place' | 'marker';
  amenity?: string;
}

interface RoutePoint {
  coordinate: { latitude: number; longitude: number };
  label: string;
  name: string;
  isMyLocation?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A56DB',
  primaryDark: '#1443B0',
  primaryLight: '#EBF5FF',
  white: '#FFFFFF',
  text: '#0F172A',
  textSec: '#475569',
  textMuted: '#94A3B8',
  border: '#CBD5E1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  surface: 'rgba(255,255,255,0.97)',
};

const INITIAL_REGION: Region = {
  latitude: 10.8231,
  longitude: 106.6297,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FILTERS = [
  { key: 'cafe', label: 'Cafe', icon: 'local-cafe' },
  { key: 'restaurant', label: 'Ăn uống', icon: 'restaurant' },
  { key: 'hospital', label: 'Y tế', icon: 'local-hospital' },
  { key: 'bank', label: 'Ngân hàng', icon: 'account-balance' },
  { key: 'atm', label: 'ATM', icon: 'local-atm' },
  { key: 'pharmacy', label: 'Thuốc', icon: 'local-pharmacy' },
  { key: 'school', label: 'Trường học', icon: 'school' },
  { key: 'fuel', label: 'Xăng', icon: 'local-gas-station' },
];

const MIN_ZOOM = 5;
const MAX_ZOOM = 20;
const RECENT_STORAGE_KEY = 'map_recent_route_points';
const LAST_REGION_KEY = 'map_last_region';
const MAX_RECENT = 8;

const AMENITY_CONFIG: Record<string, { icon: string; color: string }> = {
  cafe: { icon: 'local-cafe', color: '#F59E0B' },
  restaurant: { icon: 'restaurant', color: '#EF4444' },
  hospital: { icon: 'local-hospital', color: '#10B981' },
  bank: { icon: 'account-balance', color: '#1A56DB' },
  atm: { icon: 'local-atm', color: '#8B5CF6' },
  pharmacy: { icon: 'local-pharmacy', color: '#06B6D4' },
  school: { icon: 'school', color: '#F97316' },
  fuel: { icon: 'local-gas-station', color: '#6B7280' },
  supermarket: { icon: 'shopping-cart', color: '#EC4899' },
  default: { icon: 'place', color: '#1A56DB' },
};

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const getConfig = (amenity: string) =>
  AMENITY_CONFIG[amenity] ?? AMENITY_CONFIG.default;

// ─── AsyncStorage helpers for recent points ───────────────────────────────────

const loadRecentFromStorage = async (): Promise<SearchSuggestion[]> => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentToStorage = async (list: SearchSuggestion[]) => {
  try {
    await AsyncStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

const addToRecent = (
  list: SearchSuggestion[],
  item: SearchSuggestion,
): SearchSuggestion[] => {
  const next = [item, ...list.filter(r => r.id !== item.id)].slice(
    0,
    MAX_RECENT,
  );
  saveRecentToStorage(next);
  return next;
};

// ─── API helpers ──────────────────────────────────────────────────────────────

const fetchOverpassMarkers = async (
  region: Region,
  selectedAmenity?: string,
  signal?: AbortSignal,
): Promise<OsmMarker[]> => {
  if (region.latitudeDelta > 1) return [];
  const s = region.latitude - region.latitudeDelta / 2;
  const n = region.latitude + region.latitudeDelta / 2;
  const w = region.longitude - region.longitudeDelta / 2;
  const e = region.longitude + region.longitudeDelta / 2;
  const amenityFilter = selectedAmenity
    ? `["amenity"="${selectedAmenity}"]`
    : '["amenity"]';
  const query = `[out:json][timeout:25];node${amenityFilter}(${s},${w},${n},${e});out 500;`;
  console.log(query);
  for (const server of OVERPASS_SERVERS) {
    try {
      const res = await axios.post(
        server,
        `data=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'MyMapApp/1.0',
          },
          timeout: 30000,
          signal,
        },
      );
      const validElements = (res.data.elements as any[])
        .filter(el => el.lat && el.lon)
        .map((el, index) => ({
          id: String(el.id),
          name: el.tags?.name ?? el.tags?.amenity ?? 'Không tên',
          amenity: el.tags?.amenity ?? 'default',
          score: Object.keys(el.tags || {}).length,
          coordinate: { latitude: el.lat, longitude: el.lon },
          photoUrl: `https://i.pravatar.cc/150?img=${index % 70}`,
          address: el.tags?.['addr:street']
            ? `${el.tags?.['addr:housenumber'] ?? ''} ${
                el.tags?.['addr:street']
              }, ${el.tags?.['addr:city'] ?? ''}`.trim()
            : undefined,
          tags: el.tags,
        }));
      if (validElements.length > 0) return validElements;
    } catch (error: any) {
      console.log('====================');
      console.log('SERVER:', server);
      console.log('ERROR:', error);
      console.log('STATUS:', error?.response?.status);
      console.log('DATA:', error?.response?.data);
      console.log('MESSAGE:', error?.message);

      if (
        axios.isCancel(error) ||
        error.name === 'AbortError' ||
        error.code === 'ERR_CANCELED'
      ) {
        throw error;
      }

      continue;
    }
  }
  throw new Error('Tất cả Overpass server đều lỗi');
};

const searchNominatim = async (query: string): Promise<SearchSuggestion[]> => {
  if (!query.trim() || query.length < 2) return [];
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 8,
        countrycodes: 'vn',
        addressdetails: 1,
      },
      headers: { 'User-Agent': 'MyMapApp/1.0' },
      timeout: 8000,
    });
    return (res.data as any[]).map(item => ({
      id: String(item.place_id),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      coordinate: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      },
      type: 'place' as const,
    }));
  } catch {
    return [];
  }
};

const fetchRoute = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): Promise<{ latitude: number; longitude: number }[]> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
    const res = await axios.get(url, { timeout: 15000 });
    const route = res.data.routes[0];
    console.log(
      'distance:',
      route?.distance,
      'coords length:',
      route?.geometry?.coordinates?.length,
    );

    // distance tính bằng mét, < 10m coi như cùng điểm
    if (!route || route.distance < 10) return [];

    const coords = route.geometry?.coordinates ?? [];
    return coords.map((c: [number, number]) => ({
      latitude: c[1],
      longitude: c[0],
    }));
  } catch {
    return [];
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AmenityMarker = React.memo(
  ({
    amenity,
    photoUrl,
    onLoadEnd,
    selected,
  }: {
    amenity: string;
    photoUrl?: string;
    onLoadEnd?: () => void;
    selected?: boolean;
  }) => {
    const { icon, color } = getConfig(amenity);
    return (
      <View style={markerStyles.wrapper}>
        <View
          style={[
            markerStyles.bubble,
            { backgroundColor: selected ? COLORS.primary : color },
            selected && markerStyles.bubbleSelected,
          ]}
        >
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={markerStyles.img}
              onLoadEnd={onLoadEnd}
            />
          ) : (
            <Icon name={icon} size={16} color="#fff" />
          )}
        </View>
        <View
          style={[
            markerStyles.arrow,
            { borderTopColor: selected ? COLORS.primary : color },
          ]}
        />
      </View>
    );
  },
);

const MarkerItem = React.memo(
  ({
    item,
    selected,
    onPress,
  }: {
    item: OsmMarker;
    selected?: boolean;
    onPress: (item: OsmMarker) => void;
  }) => {
    const [track, setTrack] = useState(true);
    return (
      <Marker
        coordinate={item.coordinate}
        tracksViewChanges={track}
        onPress={() => onPress(item)}
      >
        <AmenityMarker
          amenity={item.amenity}
          photoUrl={item.photoUrl}
          selected={selected}
          onLoadEnd={() => setTimeout(() => setTrack(false), 500)}
        />
      </Marker>
    );
  },
);

const RouteMarker = React.memo(
  ({
    coordinate,
    label,
  }: {
    coordinate: { latitude: number; longitude: number };
    label: 'A' | 'B';
  }) => (
    <Marker coordinate={coordinate} tracksViewChanges={true}>
      {label === 'A' ? (
        <View style={routeMarkerStyles.dotA} />
      ) : (
        <Icon name="location-on" size={36} color={COLORS.error} />
      )}
    </Marker>
  ),
);

const MarkerRow = React.memo(({ item }: { item: OsmMarker }) => {
  const { icon, color } = getConfig(item.amenity);
  return (
    <View style={styles.rowItem}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.rowAmenity}>{item.amenity}</Text>
        <View style={styles.coordRow}>
          <Icon name="place" size={11} color={COLORS.primary} />
          <Text style={styles.coordText}>
            {item.coordinate.latitude.toFixed(4)},{' '}
            {item.coordinate.longitude.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────

interface MapScreenProps {
  navigation?: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const mapRef = useRef<MapView>(null);
  const watchId = useRef<number | null>(null);
  const regionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, OsmMarker[]>>(new Map());
  const sortedRef = useRef<OsmMarker[]>([]);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const routeCancelRef = useRef(false);

  // ── Map state ──
  const [markers, setMarkers] = useState<OsmMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [lastRegion, setLastRegion] = useState<Region>(INITIAL_REGION);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('');
  const [selectedMarker, setSelectedMarker] = useState<OsmMarker | null>(null);

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Route ──
  const [routeMode, setRouteMode] = useState(false);
  const [pointA, setPointA] = useState<RoutePoint | null>(null);
  const [pointB, setPointB] = useState<RoutePoint | null>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeLoading, setRouteLoading] = useState(false);

  // inputText: giá trị thực trong TextInput (khi focus vào "Vị trí của bạn" thì rỗng)
  const [inputAText, setInputAText] = useState('');
  const [inputBText, setInputBText] = useState('');

  // isMyLocation: input đó đang dùng vị trí hiện tại
  const [inputAIsMyLoc, setInputAIsMyLoc] = useState(false);
  const [inputBIsMyLoc, setInputBIsMyLoc] = useState(false);

  // focusedInput: input nào đang focused (null = không cái nào)
  const [focusedInput, setFocusedInput] = useState<'A' | 'B' | null>(null);

  // Khi đang focus vào input "Vị trí của bạn", ẩn text hiển thị để user nhập
  const [inputAFocusHide, setInputAFocusHide] = useState(false);
  const [inputBFocusHide, setInputBFocusHide] = useState(false);

  // route suggestions khi đang nhập
  const [routeSuggestions, setRouteSuggestions] = useState<SearchSuggestion[]>(
    [],
  );
  const [routeSuggestLoading, setRouteSuggestLoading] = useState(false);

  // ── Location ──
  const [locationPermission, setLocationPermission] = useState(false);
  const [myLocationCoord, setMyLocationCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ── Recent ──
  const [recentPoints, setRecentPoints] = useState<SearchSuggestion[]>([]);
  const [locating, setLocating] = useState(false);

  // ─── Computed display values ──────────────────────────────────────────────
  // Giá trị thực sự hiển thị trong input (khác inputAText khi myLoc + focused)
  const displayA =
    inputAIsMyLoc && !inputAFocusHide ? 'Vị trí của bạn' : inputAText;
  const displayB =
    inputBIsMyLoc && !inputBFocusHide ? 'Vị trí của bạn' : inputBText;

  // Đang nhập (text thực sự để search)
  const typingA = focusedInput === 'A' && inputAText.length > 0;
  const typingB = focusedInput === 'B' && inputBText.length > 0;
  const isTyping = typingA || typingB;

  // Dropdown: show suggestions khi đang nhập, show recent khi đang focus mà chưa nhập
  const showSearchResults = isTyping && routeSuggestions.length > 0;
  const showDropdown = focusedInput !== null || routeMode; // luôn show khi routeMode mở

  const [initialRegion, setInitialRegion] = useState<Region>(INITIAL_REGION);
  // Thêm vào đầu component MapScreen
  const route = useRoute();
  const routeParams = route.params as
    | { routeTo?: OsmMarker; selectedMarker?: OsmMarker; navKey?: number }
    | undefined;

  useEffect(() => {
    if (!routeParams?.routeTo) return;
    const place = routeParams.routeTo;
    setRouteMode(true);
    setPointB({
      coordinate: place.coordinate,
      label: 'B',
      name: place.name,
    });
    setInputBText(place.name);
    setInputBIsMyLoc(false);
    setFocusedInput('A'); // focus input A để chọn điểm xuất phát
  }, [routeParams?.routeTo]);

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const marker = routeParams?.selectedMarker;
    if (!marker) return;
    setSelectedMarker(marker);
    setTimeout(() => {
      mapRef.current?.animateCamera({
        center: marker.coordinate,
        zoom: 19,
      });
    }, 300);
  }, [routeParams?.selectedMarker, routeParams?.navKey]);

  useEffect(() => {
    sortedRef.current = [...markers].sort((a, b) => b.score - a.score);
  }, [markers]);

  useEffect(() => {
    loadRecentFromStorage().then(setRecentPoints);
    AsyncStorage.getItem(LAST_REGION_KEY).then(raw => {
      if (raw) setInitialRegion(JSON.parse(raw));
    });
    return () => {
      if (regionTimer.current) clearTimeout(regionTimer.current);
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedAmenity) return;
    const t = setTimeout(() => loadMarkers(lastRegion), 800);
    return () => clearTimeout(t);
  }, [selectedAmenity]);

  useEffect(() => {
    Animated.spring(popupAnim, {
      toValue: selectedMarker ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  }, [selectedMarker]);

  useEffect(() => {
    if (pointA && pointB) doFetchRoute();
    else setRouteCoords([]);
  }, [pointA, pointB]);

  // ─── Location ─────────────────────────────────────────────────────────────

  const startTracking = async () => {
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const ok =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!ok) return;

      try {
        await promptForEnableLocationIfNeeded();
      } catch {
        showToast('Chưa có vị trí hiện tại. Thử lại');
        return;
      }

      setLocationPermission(true);
      setLocating(true);

      Geolocation.getCurrentPosition(
        pos => {
          const coord = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setMyLocationCoord(coord);
          setLocating(false);
          mapRef.current?.animateCamera({ center: coord, zoom: 16 });
        },
        err => {
          console.log('GPS error:', err);
          showToast('Lỗi lấy vị trí hiện tại. Thử lại');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } catch (e) {
      console.warn(e);
      setLocating(false);
    }
  };

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
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      hasPerm =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
      if (hasPerm) setLocationPermission(true);
    }
    if (!hasPerm) {
      showToast('Chưa có vị trí hiện tại. Thử lại');
      return null;
    }

    try {
      await promptForEnableLocationIfNeeded();
    } catch {
      showToast('Chưa có vị trí hiện tại. Thử lại');
      return null;
    }

    if (myLocationCoord) return myLocationCoord;

    setLocating(true);
    const coord = await getMyCoord();
    setLocating(false);
    return coord;
  }, [locationPermission, myLocationCoord, getMyCoord]);

  // Bấm "Vị trí của bạn" trong dropdown → fill vào input đang focused
  const handleSelectMyLocation = useCallback(async () => {
    const coord = await requestPermAndGetCoord();
    if (!coord) return;

    const target = focusedInput ?? (pointA ? 'B' : 'A');

    if (target === 'A') {
      setPointA({
        coordinate: coord,
        label: 'A',
        name: 'Vị trí của bạn',
        isMyLocation: true,
      });
      setInputAText('');
      setInputAIsMyLoc(true);
      setInputAFocusHide(false);
    } else {
      setPointB({
        coordinate: coord,
        label: 'B',
        name: 'Vị trí của bạn',
        isMyLocation: true,
      });
      setInputBText('');
      setInputBIsMyLoc(true);
      setInputBFocusHide(false);
    }

    setRouteSuggestions([]);
    setFocusedInput(null);
    Keyboard.dismiss();
  }, [focusedInput, pointA, requestPermAndGetCoord]);

  // ─── Recent helpers ────────────────────────────────────────────────────────

  const handleSelectRecent = useCallback(
    (s: SearchSuggestion) => {
      const target = focusedInput ?? (pointA ? 'B' : 'A');

      if (target === 'A') {
        setPointA({ coordinate: s.coordinate, label: 'A', name: s.name });
        setInputAText(s.name);
        setInputAIsMyLoc(false);
        setInputAFocusHide(false);
      } else {
        setPointB({ coordinate: s.coordinate, label: 'B', name: s.name });
        setInputBText(s.name);
        setInputBIsMyLoc(false);
        setInputBFocusHide(false);
      }

      const updated = addToRecent(recentPoints, s);
      setRecentPoints(updated);
      setRouteSuggestions([]);
      setFocusedInput(null);
      Keyboard.dismiss();
    },
    [focusedInput, pointA, recentPoints],
  );

  const handleSelectSearchResult = useCallback(
    (s: SearchSuggestion) => {
      const target = focusedInput ?? (pointA ? 'B' : 'A');

      if (target === 'A') {
        setPointA({ coordinate: s.coordinate, label: 'A', name: s.name });
        setInputAText(s.name);
        setInputAIsMyLoc(false);
        setInputAFocusHide(false);
      } else {
        setPointB({ coordinate: s.coordinate, label: 'B', name: s.name });
        setInputBText(s.name);
        setInputBIsMyLoc(false);
        setInputBFocusHide(false);
      }

      const updated = addToRecent(recentPoints, s);
      setRecentPoints(updated);
      setRouteSuggestions([]);
      setFocusedInput(null);
      Keyboard.dismiss();
    },
    [focusedInput, pointA, recentPoints],
  );

  // ─── Route input handlers ──────────────────────────────────────────────────

  const onInputFocus = useCallback(
    (input: 'A' | 'B') => {
      setFocusedInput(input);
      setRouteSuggestions([]);
      if (input === 'A' && inputAIsMyLoc) {
        // Ẩn "Vị trí của bạn", cho phép nhập, nhưng giữ nguyên point
        setInputAFocusHide(true);
        setInputAText('');
      }
      if (input === 'B' && inputBIsMyLoc) {
        setInputBFocusHide(true);
        setInputBText('');
      }
    },
    [inputAIsMyLoc, inputBIsMyLoc],
  );

  const onInputBlur = useCallback(
    (input: 'A' | 'B') => {
      setTimeout(() => {
        setFocusedInput(prev => {
          // Nếu focus chuyển sang input kia thì không reset
          if (prev !== null && prev !== input) return prev;
          return null;
        });
        // Nếu user blur mà không chọn gì và input đó là myLoc → restore hiển thị
        if (input === 'A' && inputAIsMyLoc) {
          setInputAFocusHide(false);
          setInputAText('');
        }
        if (input === 'B' && inputBIsMyLoc) {
          setInputBFocusHide(false);
          setInputBText('');
        }
        // Nếu input myLoc đang bị hide và user không nhập gì (text rỗng) thì restore
      }, 200);
    },
    [inputAIsMyLoc, inputBIsMyLoc],
  );

  const onInputChange = useCallback(
    async (text: string, input: 'A' | 'B') => {
      if (input === 'A') {
        setInputAText(text);
        // Khi nhập lại thì không còn là myLoc nữa, và xoá point
        if (inputAIsMyLoc) {
          setInputAIsMyLoc(false);
          setInputAFocusHide(false);
          setPointA(null);
          setRouteCoords([]);
        }
      } else {
        setInputBText(text);
        if (inputBIsMyLoc) {
          setInputBIsMyLoc(false);
          setInputBFocusHide(false);
          setPointB(null);
          setRouteCoords([]);
        }
      }

      if (!text.trim() || text.length < 2) {
        setRouteSuggestions([]);
        return;
      }
      setRouteSuggestLoading(true);
      const results = await searchNominatim(text);
      const lower = text.toLowerCase();
      const localMatches: SearchSuggestion[] = sortedRef.current
        .filter(
          m => m.name.toLowerCase().includes(lower) && m.name !== 'Không tên',
        )
        .slice(0, 2)
        .map(m => ({
          id: `local_${m.id}`,
          name: m.name,
          displayName: `${m.name} · ${m.amenity}`,
          coordinate: m.coordinate,
          type: 'marker' as const,
        }));
      setRouteSuggestions([...localMatches, ...results]);
      setRouteSuggestLoading(false);
    },
    [inputAIsMyLoc, inputBIsMyLoc],
  );

  // ─── Map / markers ─────────────────────────────────────────────────────────

  const getCacheKey = (region: Region, amenity: string) =>
    [
      amenity || 'all',
      region.latitude.toFixed(2),
      region.longitude.toFixed(2),
    ].join('_');

  const loadMarkers = useCallback(
    async (r: Region) => {
      if (!selectedAmenity) return;
      if (r.latitudeDelta > 1) {
        setError('Zoom vào gần hơn để xem địa điểm');
        return;
      }
      const cacheKey = getCacheKey(r, selectedAmenity);
      if (cacheRef.current.has(cacheKey)) {
        setMarkers(cacheRef.current.get(cacheKey)!);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOverpassMarkers(
          r,
          selectedAmenity,
          controller.signal,
        );
        if (cacheRef.current.size >= 5) {
          const lruKey = cacheRef.current.keys().next().value as string;
          cacheRef.current.delete(lruKey);
        }
        cacheRef.current.set(cacheKey, data);
        setMarkers(data);
      } catch (e: any) {
        if (
          axios.isCancel(e) ||
          e?.name === 'AbortError' ||
          e?.name === 'CanceledError' ||
          e?.code === 'ERR_CANCELED' ||
          e?.message === 'canceled'
        )
          return;
        setError('Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    },
    [selectedAmenity],
  );

  const onRegionChangeComplete = useCallback(
    (r: Region) => {
      setLastRegion(r);
      AsyncStorage.setItem(LAST_REGION_KEY, JSON.stringify(r));
      mapRef.current?.getCamera().then(cam => {
        if (cam?.zoom != null) setCurrentZoom(cam.zoom);
      });
      if (!selectedAmenity) return;
      if (regionTimer.current) clearTimeout(regionTimer.current);
      regionTimer.current = setTimeout(() => loadMarkers(r), 600);
    },
    [loadMarkers, selectedAmenity],
  );

  const zoom = useCallback(async (delta: 1 | -1) => {
    const cam = await mapRef.current?.getCamera();
    if (!cam || cam.zoom == null) return;
    const next = Math.min(Math.max(cam.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    mapRef.current?.animateCamera({ ...cam, zoom: next }, { duration: 300 });
  }, []);

  // ─── Search (main bar) ─────────────────────────────────────────────────────

  const onSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim() || text.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchNominatim(text);
      const lower = text.toLowerCase();
      const localMatches: SearchSuggestion[] = sortedRef.current
        .filter(
          m => m.name.toLowerCase().includes(lower) && m.name !== 'Không tên',
        )
        .slice(0, 3)
        .map(m => ({
          id: `local_${m.id}`,
          name: m.name,
          displayName: `${m.name} · ${m.amenity}`,
          coordinate: m.coordinate,
          type: 'marker' as const,
          amenity: m.amenity,
        }));
      setSuggestions([...localMatches, ...results]);
      setSearchLoading(false);
    }, 400);
  }, []);

  const onSelectSuggestion = useCallback((s: SearchSuggestion) => {
    setSearchQuery(s.name);
    setSuggestions([]);
    Keyboard.dismiss();
    mapRef.current?.animateCamera({ center: s.coordinate, zoom: 16 });
  }, []);

  // ─── Route fetch ───────────────────────────────────────────────────────────

  const doFetchRoute = async () => {
    if (!pointA || !pointB) return;

    routeCancelRef.current = false;
    setRouteLoading(true);
    setRouteCoords([]);
    const coords = await fetchRoute(pointA.coordinate, pointB.coordinate);
    setRouteLoading(false);
    if (routeCancelRef.current) return;

    if (coords.length === 0) {
      showToast('Không tìm được đường đi. Hãy thử lại');
      return;
    }

    setRouteCoords(coords);
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 340, left: 40 },
      animated: true,
    });
  };

  const clearRoute = () => {
    routeCancelRef.current = true;
    setPointA(null);
    setPointB(null);
    setRouteCoords([]);
    setInputAText('');
    setInputBText('');
    setInputAIsMyLoc(false);
    setInputBIsMyLoc(false);
    setInputAFocusHide(false);
    setInputBFocusHide(false);
    setRouteSuggestions([]);
    setFocusedInput(null);
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  const visibleMarkers = useMemo(() => {
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

  const showSearchSuggestions =
    searchFocused && (suggestions.length > 0 || searchLoading);

  // Dropdown route: hiện khi routeMode mở
  // - Nếu đang nhập → show search results
  // - Nếu không nhập → show "Vị trí của bạn" + gần đây
  const showRouteDropdown =
    routeMode && routeCoords.length === 0 && (showSearchResults || !isTyping);
  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        mapType={mapType}
        showsUserLocation
        onPress={() => {
          setSelectedMarker(null);
          Keyboard.dismiss();
        }}
      >
        {visibleMarkers
          .filter(item => {
            const near = (pt: typeof pointA) => {
              if (!pt) return false;
              return (
                Math.abs(item.coordinate.latitude - pt.coordinate.latitude) <
                  0.0001 &&
                Math.abs(item.coordinate.longitude - pt.coordinate.longitude) <
                  0.0001
              );
            };
            return !near(pointA) && !near(pointB);
          })
          .map(item => (
            <MarkerItem
              key={item.id}
              item={item}
              selected={selectedMarker?.id === item.id}
              onPress={m => setSelectedMarker(m)}
            />
          ))}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}

        {pointA && <RouteMarker coordinate={pointA.coordinate} label="A" />}
        {pointB && <RouteMarker coordinate={pointB.coordinate} label="B" />}
      </MapView>

      {/* ── Loading / Error ── */}
      {(loading || locating) && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {locating ? 'Đang lấy vị trí hiện tại...' : 'Đang tải địa điểm...'}
          </Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.hintBadge}>
          <Icon name="info-outline" size={14} color={COLORS.warning} />
          <Text style={styles.hintText}>{error}</Text>
        </View>
      )}

      {/* ── Top Bar: Search ── */}
      {!routeMode && (
        <View style={styles.topBar}>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBox,
                searchFocused && styles.searchBoxFocused,
              ]}
            >
              <Icon
                name="search"
                size={18}
                color={searchFocused ? COLORS.primary : COLORS.textMuted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm địa điểm..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                >
                  <Icon name="close" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.statsBox}>
              <Text style={styles.statsValue}>{visibleMarkers.length}</Text>
              <Text style={styles.statsLabel}>{'HIỂN\nTHỊ'}</Text>
            </View>
            <TouchableOpacity
              style={styles.routeToggleBtn}
              onPress={() => {
                setRouteMode(true);
                setSelectedMarker(null);
                Keyboard.dismiss();
              }}
            >
              <Icon name="directions" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {showSearchSuggestions && (
            <View style={styles.suggestionList}>
              {searchLoading && (
                <View style={styles.suggestLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.suggestLoadingText}>Đang tìm...</Text>
                </View>
              )}
              {suggestions.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionItem}
                  onPress={() => onSelectSuggestion(s)}
                >
                  <View
                    style={[
                      styles.suggestIcon,
                      {
                        backgroundColor:
                          s.type === 'marker' ? COLORS.primaryLight : '#F1F5F9',
                      },
                    ]}
                  >
                    <Icon
                      name={
                        s.type === 'marker'
                          ? getConfig(s.amenity ?? '').icon
                          : 'place'
                      }
                      size={14}
                      color={
                        s.type === 'marker' ? COLORS.primary : COLORS.textSec
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestName} numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text style={styles.suggestSub} numberOfLines={1}>
                      {s.displayName}
                    </Text>
                  </View>
                  <Icon name="north-west" size={12} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Route panel ── */}
      {routeMode && (
        <View style={styles.routePanel}>
          {/* Header */}
          <View style={styles.routePanelHeader}>
            <Icon name="directions" size={18} color={COLORS.primary} />
            <Text style={styles.routePanelTitle}>Chỉ đường</Text>
            <TouchableOpacity
              style={styles.routeCloseBtn}
              onPress={() => {
                setRouteMode(false);
                clearRoute();
              }}
            >
              <Icon name="close" size={20} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.routeInputsWrapper}>
            {/* Icon column */}
            <View style={styles.routeIconsCol}>
              {inputAIsMyLoc ? (
                <View style={routeMarkerStyles.dotOuter}>
                  <View style={routeMarkerStyles.panelDotBlue} />
                </View>
              ) : (
                <View style={routeMarkerStyles.panelDot} />
              )}
              <View style={styles.routeDotsMiddle}>
                <View style={styles.routeDotSmall} />
                <View style={styles.routeDotSmall} />
                <View style={styles.routeDotSmall} />
              </View>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={22}
                color={inputBIsMyLoc ? COLORS.primary : COLORS.error}
              />
            </View>

            {/* Text inputs column */}
            <View style={styles.routeInputsCol}>
              {/* Input A */}
              <View
                style={[
                  styles.routeInputWrap,
                  focusedInput === 'A' && styles.routeInputWrapActive,
                ]}
              >
                <TextInput
                  style={[
                    styles.routeInput,
                    inputAIsMyLoc && !inputAFocusHide && styles.routeInputMyLoc,
                  ]}
                  placeholder="Chọn vị trí bắt đầu"
                  placeholderTextColor={COLORS.textMuted}
                  value={displayA}
                  onFocus={() => onInputFocus('A')}
                  onBlur={() => onInputBlur('A')}
                  onChangeText={t => onInputChange(t, 'A')}
                />
                {(inputAText.length > 0 || inputAIsMyLoc) && (
                  <TouchableOpacity
                    style={styles.routeInputClear}
                    onPress={() => {
                      setPointA(null);
                      setInputAText('');
                      setInputAIsMyLoc(false);
                      setInputAFocusHide(false);
                      setRouteCoords([]);
                    }}
                  >
                    <Icon name="cancel" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Input B */}
              <View
                style={[
                  styles.routeInputWrap,
                  focusedInput === 'B' && styles.routeInputWrapActive,
                ]}
              >
                <TextInput
                  style={[
                    styles.routeInput,
                    inputBIsMyLoc && !inputBFocusHide && styles.routeInputMyLoc,
                  ]}
                  placeholder="Chọn điểm đến"
                  placeholderTextColor={COLORS.textMuted}
                  value={displayB}
                  onFocus={() => onInputFocus('B')}
                  onBlur={() => onInputBlur('B')}
                  onChangeText={t => onInputChange(t, 'B')}
                />
                {(inputBText.length > 0 || inputBIsMyLoc) && (
                  <TouchableOpacity
                    style={styles.routeInputClear}
                    onPress={() => {
                      setPointB(null);
                      setInputBText('');
                      setInputBIsMyLoc(false);
                      setInputBFocusHide(false);
                      setRouteCoords([]);
                    }}
                  >
                    <Icon name="cancel" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Swap */}
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={() => {
                const tmpPoint = pointA;
                const tmpText = inputAText;
                const tmpIsMyLoc = inputAIsMyLoc;

                setPointA(pointB ? { ...pointB, label: 'A' } : null);
                setInputAText(inputBText);
                setInputAIsMyLoc(inputBIsMyLoc);
                setInputAFocusHide(false);

                setPointB(tmpPoint ? { ...tmpPoint, label: 'B' } : null);
                setInputBText(tmpText);
                setInputBIsMyLoc(tmpIsMyLoc);
                setInputBFocusHide(false);

                setRouteCoords([]);
              }}
            >
              <Icon name="swap-vert" size={25} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {(routeLoading || locating) && (
            <View style={styles.routeLoadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.routeLoadingText}>
                {locating ? 'Đang lấy vị trí hiện tại...' : 'Đang tìm đường...'}
              </Text>
            </View>
          )}

          {/* ── Dropdown ── */}
          {showRouteDropdown && (
            <View style={styles.routeDropdown}>
              {/* Search results */}
              {showSearchResults && (
                <>
                  {routeSuggestLoading && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                      style={{ margin: 8 }}
                    />
                  )}
                  {routeSuggestions.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectSearchResult(s)}
                    >
                      <View style={styles.dropdownIconWrap}>
                        <Icon name="place" size={16} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestName} numberOfLines={1}>
                          {s.name}
                        </Text>
                        <Text style={styles.suggestSub} numberOfLines={1}>
                          {s.displayName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* My location + recent (khi không đang nhập) */}
              {!isTyping && (
                <>
                  {/* "Vị trí của bạn" — ẩn khi đang focus input đã là myLoc */}
                  {!(focusedInput === 'A' && inputAIsMyLoc) &&
                    !(focusedInput === 'B' && inputBIsMyLoc) && (
                      <TouchableOpacity
                        style={styles.myLocRow}
                        onPress={handleSelectMyLocation}
                      >
                        <View style={styles.myLocIconWrap}>
                          <Icon
                            name="my-location"
                            size={16}
                            color={COLORS.primary}
                          />
                        </View>
                        <Text style={styles.myLocText}>Vị trí của bạn</Text>
                      </TouchableOpacity>
                    )}

                  {/* Gần đây */}
                  {recentPoints.length > 0 && (
                    <>
                      <View style={styles.recentHeader}>
                        <Text style={styles.recentHeaderText}>Gần đây</Text>
                      </View>
                      {recentPoints.map(s => (
                        <TouchableOpacity
                          key={s.id}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectRecent(s)}
                        >
                          <View style={styles.dropdownIconWrap}>
                            <Icon
                              name="history"
                              size={16}
                              color={COLORS.textSec}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.suggestName} numberOfLines={1}>
                              {s.name}
                            </Text>
                            <Text style={styles.suggestSub} numberOfLines={1}>
                              {s.displayName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* ── Filter chips ── */}
      {!routeMode && (
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            keyboardShouldPersistTaps="always"
          >
            {FILTERS.map(f => {
              const active = selectedAmenity === f.key;
              const color = getConfig(f.key).color;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterChip,
                    active && { backgroundColor: color, borderColor: color },
                  ]}
                  onPress={() =>
                    setSelectedAmenity(prev => (prev === f.key ? '' : f.key))
                  }
                >
                  <Icon
                    name={f.icon}
                    size={14}
                    color={active ? '#fff' : color}
                  />
                  <Text
                    style={[styles.filterText, active && { color: '#fff' }]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Right action buttons ── */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            currentZoom != null && currentZoom >= MAX_ZOOM && { opacity: 0.4 },
          ]}
          onPress={() => zoom(1)}
          disabled={currentZoom != null && currentZoom >= MAX_ZOOM}
        >
          <Icon name="add" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            currentZoom != null && currentZoom <= MIN_ZOOM && { opacity: 0.4 },
          ]}
          onPress={() => zoom(-1)}
          disabled={currentZoom != null && currentZoom <= MIN_ZOOM}
        >
          <Icon name="remove" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <View style={styles.dividerHorizontal}>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={startTracking}>
          <Icon name="my-location" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            mapType === 'satellite' && styles.actionActive,
          ]}
          onPress={() =>
            setMapType(t => (t === 'standard' ? 'satellite' : 'standard'))
          }
        >
          <Icon
            name="layers"
            size={22}
            color={mapType === 'satellite' ? '#fff' : COLORS.primaryDark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => loadMarkers(lastRegion)}
        >
          <Icon name="refresh" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* ── Selected marker popup ── */}
      <Animated.View
        style={[
          styles.markerPopup,
          {
            opacity: popupAnim,
            transform: [
              {
                translateY: popupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            pointerEvents: selectedMarker ? 'auto' : 'none',
          },
        ]}
      >
        {selectedMarker && (
          <>
            <View style={styles.popupRow}>
              <View
                style={[
                  styles.popupIcon,
                  {
                    backgroundColor:
                      getConfig(selectedMarker.amenity).color + '22',
                  },
                ]}
              >
                <Icon
                  name={getConfig(selectedMarker.amenity).icon}
                  size={20}
                  color={getConfig(selectedMarker.amenity).color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.popupName} numberOfLines={1}>
                  {selectedMarker.name}
                </Text>
                <Text style={styles.popupAmenity}>
                  {selectedMarker.amenity}
                  {selectedMarker.address ? ` · ${selectedMarker.address}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.popupClose}
                onPress={() => setSelectedMarker(null)}
              >
                <Icon name="close" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.popupActions}>
              <TouchableOpacity
                style={styles.popupDetailBtn}
                onPress={() =>
                  navigation?.navigate('PlaceDetail', {
                    screen: 'PlaceDetailHome',
                    params: {
                      place: selectedMarker,
                    },
                  })
                }
              >
                <Icon name="info" size={14} color={COLORS.white} />
                <Text style={styles.popupDetailText}>Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupRouteBtn}
                onPress={() => {
                  setRouteMode(true);
                  setPointB({
                    coordinate: selectedMarker.coordinate,
                    label: 'B',
                    name: selectedMarker.name,
                  });
                  setInputBText(selectedMarker.name);
                  setInputBIsMyLoc(false);
                  setSelectedMarker(null);
                }}
              >
                <Icon name="directions" size={14} color={COLORS.primary} />
                <Text style={styles.popupRouteBtnText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* ── Bottom sheet ── */}
      {!routeMode && !selectedMarker && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Icon name="place" size={20} color={COLORS.primary} />
              <Text style={styles.sheetTitle}>Địa điểm trong vùng</Text>
            </View>
            <View style={styles.liveChip}>
              <Text style={styles.liveText}>{'LIVE\nFEED'}</Text>
            </View>
          </View>

          {visibleMarkers.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Icon name="zoom-in" size={32} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {selectedAmenity
                  ? 'Không có địa điểm trong vùng này'
                  : 'Chọn danh mục để xem địa điểm'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={visibleMarkers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMarker(item);
                    mapRef.current?.animateCamera({
                      center: item.coordinate,
                      zoom: 19,
                    });
                  }}
                >
                  <MarkerRow item={item} />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const markerStyles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  bubbleSelected: {
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    transform: [{ scale: 1.15 }],
  },
  img: { width: 36, height: 36, borderRadius: 18 },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});

const routeMarkerStyles = StyleSheet.create({
  dotA: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6B7280',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  // Dot trong route panel (left column, input A)
  panelDot: {
    marginTop: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  dotOuter: {
    width: 18,
    height: 18,
    borderRadius: 11,
    backgroundColor: 'rgba(59,130,246,0.15)', // xanh nhạt
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelDotBlue: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderWidth: 2,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // ── Top bar ──
  topBar: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 0) + 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBoxFocused: { borderColor: COLORS.primary },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text, height: 50 },
  statsBox: {
    height: 50,
    minWidth: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },
  statsLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 10,
  },
  routeToggleBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },

  // ── Suggestions (main search) ──
  suggestionList: {
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    elevation: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  suggestLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestLoadingText: { fontSize: 12, color: COLORS.textMuted },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  suggestIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  suggestSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },

  // ── Filter bar ──
  filterBar: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 0) + 82,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.textSec },

  // ── Route panel ──
  routePanel: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 0) + 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 20,
  },
  routePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  routePanelTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  routeCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInputsWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeIconsCol: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  routeDotsMiddle: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 24,
    gap: 0.5,
    marginVertical: 5,
  },
  routeDotSmall: {
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
  },
  routeInputsCol: { flex: 1, gap: 8 },
  routeInputWrap: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingLeft: 12,
    paddingRight: 6,
  },
  routeInputWrapActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  routeInput: { flex: 1, fontSize: 13, color: COLORS.text, height: 42 },
  routeInputMyLoc: { color: COLORS.primary, fontWeight: '600' },
  routeInputClear: { padding: 4 },
  swapBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  routeLoadingText: { fontSize: 12, color: COLORS.primary },

  // ── Route dropdown ──
  routeDropdown: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  dropdownIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  myLocIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  recentHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Loading / Error ──
  loadingBadge: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 0) + 130,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
  },
  loadingText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  hintBadge: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 0) + 130,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 6,
  },
  hintText: { fontSize: 12, color: '#92400E' },

  // ── Right actions ──
  rightActions: {
    position: 'absolute',
    right: 16,
    top: (StatusBar.currentHeight ?? 0) + 130,
    gap: 8,
    zIndex: 10,
  },
  actionBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionActive: { backgroundColor: COLORS.primary },
  dividerHorizontal: { alignItems: 'center', paddingVertical: 2 },
  dividerLine: { width: 32, height: 1, backgroundColor: '#E2E8F0' },

  // ── Marker popup ──
  markerPopup: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    elevation: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    zIndex: 30,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  popupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  popupAmenity: {
    fontSize: 12,
    color: COLORS.textSec,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  popupClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupActions: { flexDirection: 'row', gap: 10 },
  popupDetailBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  popupDetailText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  popupRouteBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  popupRouteBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  // ── Bottom sheet ──
  bottomSheet: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 250,
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  liveChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    lineHeight: 13,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  rowAmenity: {
    fontSize: 11,
    color: COLORS.textSec,
    marginTop: 1,
    textTransform: 'capitalize',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 2,
  },
  coordText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default MapScreen;
