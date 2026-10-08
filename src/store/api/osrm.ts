import axios from 'axios';
import Config from 'react-native-config';
import { isNetworkConnected } from '@/utils/isNetworkConnected';
import { InteractionManager } from 'react-native';

export type OrsProfile = 'driving-car' | 'cycling-regular' | 'foot-walking';

export interface RouteAlternative {
  coords: { latitude: number; longitude: number }[];
  distanceMeters: number;
  durationSeconds: number;
  steps: {
    distanceMeters: number;
    durationSeconds: number;
    type: number;
    name: string;
  }[];
}

const ORS_BASE_URL = 'https://api.heigit.org/openrouteservice/v2/directions';

export const MAX_ALTERNATIVES = 3;

const haversineDistance = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number => {
  const R = 6371000;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ALTERNATIVE_ROUTES_MAX_DISTANCE_METERS = 99000;

const perpendicularDistance = (
  p: { latitude: number; longitude: number },
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number => {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((a.latitude * Math.PI) / 180);

  const px = p.longitude * metersPerDegreeLng;
  const py = p.latitude * metersPerDegreeLat;
  const ax = a.longitude * metersPerDegreeLng;
  const ay = a.latitude * metersPerDegreeLat;
  const bx = b.longitude * metersPerDegreeLng;
  const by = b.latitude * metersPerDegreeLat;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const projX = ax + clampedT * dx;
  const projY = ay + clampedT * dy;

  return Math.hypot(px - projX, py - projY);
};

const simplifyPathVariableAsync = async (
  points: { latitude: number; longitude: number }[],
  totalDistanceMeters: number,
): Promise<{ latitude: number; longitude: number }[]> => {
  if (totalDistanceMeters < 50000 || points.length < 200) {
    return simplifyPathAsync(points, 1);
  }

  const avgMetersPerPoint = totalDistanceMeters / points.length;
  const edgePointCount = Math.min(
    Math.ceil(5000 / avgMetersPerPoint),
    Math.floor(points.length / 4),
  );

  const startSegment = points.slice(0, edgePointCount);
  const middleSegment = points.slice(
    edgePointCount,
    points.length - edgePointCount,
  );
  const endSegment = points.slice(points.length - edgePointCount);

  const [simplifiedStart, simplifiedMiddle, simplifiedEnd] = await Promise.all([
    simplifyPathAsync(startSegment, 1),
    simplifyPathAsync(middleSegment, 5),
    simplifyPathAsync(endSegment, 1),
  ]);

  return [
    ...simplifiedStart,
    ...simplifiedMiddle.slice(1),
    ...simplifiedEnd.slice(1),
  ];
};

const simplifyPathAsync = (
  points: { latitude: number; longitude: number }[],
  toleranceMeters: number,
): Promise<{ latitude: number; longitude: number }[]> => {
  return new Promise(resolve => {
    if (points.length <= 2) {
      resolve(points);
      return;
    }

    const keep = new Array(points.length).fill(false);
    keep[0] = true;
    keep[points.length - 1] = true;

    const stack: [number, number][] = [[0, points.length - 1]];
    let iterations = 0;
    const YIELD_EVERY = 500;

    const processChunk = () => {
      const chunkStart = Date.now();

      while (stack.length > 0) {
        const [startIdx, endIdx] = stack.pop()!;

        if (endIdx - startIdx < 2) {
          iterations++;
          continue;
        }

        const first = points[startIdx];
        const last = points[endIdx];

        let maxDist = 0;
        let maxIndex = startIdx;

        for (let i = startIdx + 1; i < endIdx; i++) {
          const dist = perpendicularDistance(points[i], first, last);
          if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
          }
        }

        if (maxDist > toleranceMeters) {
          keep[maxIndex] = true;
          stack.push([startIdx, maxIndex]);
          stack.push([maxIndex, endIdx]);
        }

        iterations++;

        if (iterations % YIELD_EVERY === 0 || Date.now() - chunkStart > 16) {
          setTimeout(processChunk, 0);
          return;
        }
      }

      const result: { latitude: number; longitude: number }[] = [];
      for (let i = 0; i < points.length; i++) {
        if (keep[i]) result.push(points[i]);
      }
      resolve(result);
    };

    processChunk();
  });
};

export const fetchRouteDetails = async (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  profile: OrsProfile,
): Promise<RouteAlternative[] | null> => {
  const connected = await isNetworkConnected();
  if (!connected) return null;

  const straightLineDistance = haversineDistance(from, to);
  const allowAlternatives =
    straightLineDistance <= ALTERNATIVE_ROUTES_MAX_DISTANCE_METERS;

  try {
    const url = `${ORS_BASE_URL}/${profile}`;
    const res = await axios.post(
      url,
      {
        coordinates: [
          [from.longitude, from.latitude],
          [to.longitude, to.latitude],
        ],
        instructions: true,
        ...(allowAlternatives && {
          alternative_routes: {
            target_count: MAX_ALTERNATIVES,
            weight_factor: 1.4,
            share_factor: 0.6,
          },
        }),
      },
      {
        timeout: 15000,
        headers: {
          Authorization: Config.ORS_API_KEY,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );

    const rawRoutes = res.data.routes ?? [];

    const parsed = (
      await Promise.all(
        rawRoutes.map(
          (route: any): Promise<RouteAlternative | null> =>
            new Promise(resolve => {
              if (!route || route.summary?.distance < 10) {
                resolve(null);
                return;
              }

              InteractionManager.runAfterInteractions(async () => {
                const rawCoords = decodePolyline(route.geometry);
                const t0 = Date.now();
                const coords = await simplifyPathVariableAsync(
                  rawCoords,
                  route.summary.distance,
                );
                const rawSteps = route.segments?.[0]?.steps ?? [];
                const steps = rawSteps.map((s: any) => ({
                  distanceMeters: s.distance ?? 0,
                  durationSeconds: s.duration ?? 0,
                  type: s.type ?? 6,
                  name: s.name && s.name !== '-' ? s.name : '',
                }));

                resolve({
                  coords,
                  distanceMeters: route.summary.distance,
                  durationSeconds: route.summary.duration,
                  steps,
                });
              });
            }),
        ),
      )
    ).filter((r: RouteAlternative | null): r is RouteAlternative => r !== null);

    return parsed.length > 0 ? parsed : null;
  } catch (error: any) {
    return null;
  }
};

const decodePolyline = (
  encoded: string,
): { latitude: number; longitude: number }[] => {
  const coords: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b: number;

    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push({ latitude: lat * 1e-5, longitude: lng * 1e-5 });
  }

  return coords;
};
