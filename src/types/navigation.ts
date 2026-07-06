import type {
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import { OsmMarker } from './mapScreen.type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RedirectTarget = {
  screen: keyof RootStackParamList;
  params?: any;
};

export type RootStackParamList = {
  Auth: { redirectTo?: RedirectTarget } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  PlaceDetail: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Favorites: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type PlaceDetailStackParamList = {
  PlaceDetailHome: { place: OsmMarker };
  CheckinList: { osmId: string; placeName: string };
  ReviewList: { osmId: string; placeName: string };
  ProfileReview: { userId: string; name?: string; avatar?: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  PersonalInfo: undefined;
  ChangePassword: undefined;
};

export type PlaceDetailRouteProp = RouteProp<
  PlaceDetailStackParamList,
  'PlaceDetailHome'
>;

export type PlaceDetailNavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'PlaceDetailHome'
>;

export type ReviewListRoutePropType = RouteProp<
  PlaceDetailStackParamList,
  'ReviewList'
>;
export type NavProp = NativeStackNavigationProp<
  PlaceDetailStackParamList,
  'ReviewList'
>;
