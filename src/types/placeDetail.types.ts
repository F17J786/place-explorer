export interface Review {
  id: string;
  osmId: string;
  userId: string;
  rating: number;
  comment: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video')[];
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Favorite {
  id: string;
  userId: string;
  osmId: string;
  createdAt: string;
}

export interface Checkin {
  id: string;
  userId: string;
  osmId: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface PlaceRecord {
  id: string;
  osmId: string;
  osmType: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  osmId: string;
  userId: string;
  rating: number;
  comment: string;
  mediaUrls: string[];
  mediaTypes: string[];
  createdAt: string;
}

export interface CreateCheckinPayload {
  userId: string;
  osmId: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  createdAt: string;
}

export interface CreateFavoritePayload {
  userId: string;
  osmId: string;
  createdAt: string;
}

export interface UpdateReviewPayload {
  id: string;
  osmId: string;
  rating: number;
  comment: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video')[];
  createdAt: string;
}
