import { GeoPoint } from './user.interface';

export interface CitySelection {
  city: string;
  location: GeoPoint;
}

export interface CitySuggestion {
  city: string;
  label: string;
  context: string;
  location: GeoPoint;
}
