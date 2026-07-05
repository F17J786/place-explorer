import { useCallback, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { searchNominatim } from '@/store/api/nominatim';
import { addToRecent, loadRecentFromStorage } from '@/storage/recentPoints';
import {
  OsmMarker,
  RoutePoint,
  SearchSuggestion,
} from '@/types/mapScreen.type';

interface UseRouteInputsParams {
  sortedRef: React.MutableRefObject<OsmMarker[]>;
  requestPermAndGetCoord: () => Promise<{
    latitude: number;
    longitude: number;
  } | null>;
}

export const useRouteInputs = ({
  sortedRef,
  requestPermAndGetCoord,
}: UseRouteInputsParams) => {
  const [routeMode, setRouteMode] = useState(false);

  const [pointA, setPointA] = useState<RoutePoint | null>(null);
  const [pointB, setPointB] = useState<RoutePoint | null>(null);

  const [inputAText, setInputAText] = useState('');
  const [inputBText, setInputBText] = useState('');
  const [inputAIsMyLoc, setInputAIsMyLoc] = useState(false);
  const [inputBIsMyLoc, setInputBIsMyLoc] = useState(false);
  const [inputAFocusHide, setInputAFocusHide] = useState(false);
  const [inputBFocusHide, setInputBFocusHide] = useState(false);

  const [focusedInput, setFocusedInput] = useState<'A' | 'B' | null>(null);

  const [routeSuggestions, setRouteSuggestions] = useState<SearchSuggestion[]>(
    [],
  );
  const [routeSuggestLoading, setRouteSuggestLoading] = useState(false);

  const [recentPoints, setRecentPoints] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    loadRecentFromStorage().then(setRecentPoints);
  }, []);

  const displayA =
    inputAIsMyLoc && !inputAFocusHide ? 'Vị trí của bạn' : inputAText;
  const displayB =
    inputBIsMyLoc && !inputBFocusHide ? 'Vị trí của bạn' : inputBText;

  const typingA = focusedInput === 'A' && inputAText.length > 0;
  const typingB = focusedInput === 'B' && inputBText.length > 0;
  const isTyping = typingA || typingB;

  const showSearchResults = isTyping && routeSuggestions.length > 0;
  const showRouteDropdownBase = routeMode && (showSearchResults || !isTyping);

  const onInputFocus = useCallback(
    (input: 'A' | 'B') => {
      setFocusedInput(input);
      setRouteSuggestions([]);
      if (input === 'A' && inputAIsMyLoc) {
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
          if (prev !== null && prev !== input) return prev;
          return null;
        });
        if (input === 'A' && inputAIsMyLoc) {
          setInputAFocusHide(false);
          setInputAText('');
        }
        if (input === 'B' && inputBIsMyLoc) {
          setInputBFocusHide(false);
          setInputBText('');
        }
      }, 200);
    },
    [inputAIsMyLoc, inputBIsMyLoc],
  );

  const onInputChange = useCallback(
    async (text: string, input: 'A' | 'B') => {
      if (input === 'A') {
        setInputAText(text);
        if (inputAIsMyLoc) {
          setInputAIsMyLoc(false);
          setInputAFocusHide(false);
          setPointA(null);
        }
      } else {
        setInputBText(text);
        if (inputBIsMyLoc) {
          setInputBIsMyLoc(false);
          setInputBFocusHide(false);
          setPointB(null);
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
    [inputAIsMyLoc, inputBIsMyLoc, sortedRef],
  );

  const selectForTarget = useCallback(
    (
      s: SearchSuggestion,
      name?: string,
      coordinate?: SearchSuggestion['coordinate'],
    ) => {
      const target = focusedInput ?? (pointA ? 'B' : 'A');
      const displayName = name ?? s.name;
      const coord = coordinate ?? s.coordinate;

      if (target === 'A') {
        setPointA({ coordinate: coord, label: 'A', name: displayName });
        setInputAText(displayName);
        setInputAIsMyLoc(false);
        setInputAFocusHide(false);
      } else {
        setPointB({ coordinate: coord, label: 'B', name: displayName });
        setInputBText(displayName);
        setInputBIsMyLoc(false);
        setInputBFocusHide(false);
      }

      setRouteSuggestions([]);
      setFocusedInput(null);
      Keyboard.dismiss();
    },
    [focusedInput, pointA],
  );

  const handleSelectSearchResult = useCallback(
    (s: SearchSuggestion) => {
      selectForTarget(s);
      setRecentPoints(prev => addToRecent(prev, s));
    },
    [selectForTarget],
  );

  const handleSelectRecent = useCallback(
    (s: SearchSuggestion) => {
      selectForTarget(s);
      setRecentPoints(prev => addToRecent(prev, s));
    },
    [selectForTarget],
  );

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

  const clearInputA = useCallback(() => {
    setPointA(null);
    setInputAText('');
    setInputAIsMyLoc(false);
    setInputAFocusHide(false);
  }, []);

  const clearInputB = useCallback(() => {
    setPointB(null);
    setInputBText('');
    setInputBIsMyLoc(false);
    setInputBFocusHide(false);
  }, []);

  const swapPoints = useCallback(() => {
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
  }, [pointA, pointB, inputAText, inputBText, inputAIsMyLoc, inputBIsMyLoc]);

  const resetRoute = useCallback(() => {
    setPointA(null);
    setPointB(null);
    setInputAText('');
    setInputBText('');
    setInputAIsMyLoc(false);
    setInputBIsMyLoc(false);
    setInputAFocusHide(false);
    setInputBFocusHide(false);
    setRouteSuggestions([]);
    setFocusedInput(null);
  }, []);

  const openRouteToPlace = useCallback((place: OsmMarker) => {
    setRouteMode(true);
    setPointB({ coordinate: place.coordinate, label: 'B', name: place.name });
    setInputBText(place.name);
    setInputBIsMyLoc(false);
  }, []);

  return {
    routeMode,
    setRouteMode,
    pointA,
    pointB,
    inputAText,
    inputBText,
    inputAIsMyLoc,
    inputBIsMyLoc,
    inputAFocusHide,
    inputBFocusHide,
    focusedInput,
    displayA,
    displayB,
    isTyping,
    showSearchResults,
    showRouteDropdownBase,
    routeSuggestions,
    routeSuggestLoading,
    recentPoints,
    onInputFocus,
    onInputBlur,
    onInputChange,
    handleSelectSearchResult,
    handleSelectRecent,
    handleSelectMyLocation,
    clearInputA,
    clearInputB,
    swapPoints,
    resetRoute,
    openRouteToPlace,
  };
};
