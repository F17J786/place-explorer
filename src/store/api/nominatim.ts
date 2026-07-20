import axios from 'axios';
import { SearchSuggestion } from '@/types/mapScreen.type';
import { isNetworkConnected } from '@/utils/isNetworkConnected';

export const searchNominatim = async (
  query: string,
): Promise<SearchSuggestion[]> => {
  if (!query.trim() || query.length < 2) return [];

  const connected = await isNetworkConnected();
  if (!connected) return [];

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
