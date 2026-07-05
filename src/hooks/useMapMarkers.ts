import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Region } from 'react-native-maps';
import { fetchOverpassMarkers } from '@/store/api/overpass';
import { saveLastRegion } from '@/storage/lastRegion';
import { OsmMarker } from '@/types/mapScreen.type';

const getCacheKey = (region: Region, amenity: string) =>
  [
    amenity || 'all',
    region.latitude.toFixed(2),
    region.longitude.toFixed(2),
  ].join('_');

export const useMapMarkers = (selectedAmenity: string) => {
  const [markers, setMarkers] = useState<OsmMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRegion, setLastRegion] = useState<Region | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, OsmMarker[]>>(new Map());
  const regionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortedRef = useRef<OsmMarker[]>([]);

  useEffect(() => {
    sortedRef.current = [...markers].sort((a, b) => b.score - a.score);
  }, [markers]);

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

  useEffect(() => {
    if (!selectedAmenity || !lastRegion) return;
    const t = setTimeout(() => loadMarkers(lastRegion), 800);
    return () => clearTimeout(t);
  }, [selectedAmenity]);

  const onRegionChangeComplete = useCallback(
    (r: Region) => {
      setLastRegion(r);
      saveLastRegion(r);
      if (!selectedAmenity) return;
      if (regionTimer.current) clearTimeout(regionTimer.current);
      regionTimer.current = setTimeout(() => loadMarkers(r), 600);
    },
    [loadMarkers, selectedAmenity],
  );

  useEffect(() => {
    return () => {
      if (regionTimer.current) clearTimeout(regionTimer.current);
    };
  }, []);

  return {
    markers,
    sortedRef,
    loading,
    error,
    lastRegion,
    setLastRegion,
    loadMarkers,
    onRegionChangeComplete,
  };
};
