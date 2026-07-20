import axios from 'axios';
import { Region } from 'react-native-maps';
import { OVERPASS_SERVERS } from '@/constants/constants';
import { OsmMarker } from '@/types/mapScreen.type';
import { isNetworkConnected } from '@/utils/isNetworkConnected';

export const fetchOverpassMarkers = async (
  region: Region,
  selectedAmenity?: string,
  signal?: AbortSignal,
): Promise<OsmMarker[]> => {
  if (region.latitudeDelta > 1) return [];

  const connected = await isNetworkConnected();
  if (!connected) {
    throw new Error('Không có mạng');
  }

  const s = region.latitude - region.latitudeDelta / 2;
  const n = region.latitude + region.latitudeDelta / 2;
  const w = region.longitude - region.longitudeDelta / 2;
  const e = region.longitude + region.longitudeDelta / 2;
  const amenityFilter = selectedAmenity
    ? `["amenity"="${selectedAmenity}"]`
    : '["amenity"]';
  const query = `[out:json][timeout:25];node${amenityFilter}(${s},${w},${n},${e});out 500;`;

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
