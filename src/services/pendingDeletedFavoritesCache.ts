import type { Favorite } from '@/types/placeDetail.types';

const pendingDeletedFavorites = new Map<string, Favorite>();

const buildKey = (userId: string, osmId: string) => `${userId}:${osmId}`;

export const savePendingDeletedFavorite = (
  userId: string,
  osmId: string,
  favorite: Favorite,
): void => {
  pendingDeletedFavorites.set(buildKey(userId, osmId), favorite);
};

export const getPendingDeletedFavorite = (
  userId: string,
  osmId: string,
): Favorite | undefined => pendingDeletedFavorites.get(buildKey(userId, osmId));

export const clearPendingDeletedFavorite = (
  userId: string,
  osmId: string,
): void => {
  pendingDeletedFavorites.delete(buildKey(userId, osmId));
};
