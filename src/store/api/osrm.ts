import axios from 'axios';
import { isNetworkConnected } from '@/utils/isNetworkConnected';

export const fetchRoute = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): Promise<{ latitude: number; longitude: number }[]> => {
  const connected = await isNetworkConnected();
  if (!connected) return [];

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
    const res = await axios.get(url, { timeout: 15000 });
    const route = res.data.routes[0];

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
