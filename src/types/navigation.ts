import { OsmMarker } from '@/screens/Map/MapScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PlaceDetail: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type PlaceDetailStackParamList = {
  PlaceDetailHome: { place: OsmMarker };
  CheckinList: { osmId: string; placeName: string };
  ReviewList: { osmId: string; placeName: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  PersonalInfo: undefined;
  ChangePassword: undefined;
};
