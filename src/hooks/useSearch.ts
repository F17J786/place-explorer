import { useCallback, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import MapView from 'react-native-maps';
import { searchNominatim } from '@/store/api/nominatim';
import { OsmMarker, SearchSuggestion } from '@/types/mapScreen.type';

export const useSearch = (
  mapRef: React.RefObject<MapView | null>,
  sortedRef: React.MutableRefObject<OsmMarker[]>,
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchChange = useCallback(
    (text: string) => {
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
    },
    [sortedRef],
  );

  const onSelectSuggestion = useCallback(
    (s: SearchSuggestion) => {
      setSearchQuery(s.name);
      setSuggestions([]);
      Keyboard.dismiss();
      mapRef.current?.animateCamera({ center: s.coordinate, zoom: 16 });
    },
    [mapRef],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
  }, []);

  return {
    searchQuery,
    searchFocused,
    setSearchFocused,
    suggestions,
    searchLoading,
    onSearchChange,
    onSelectSuggestion,
    clearSearch,
  };
};
