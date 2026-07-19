import { Animal } from './animal.interface';

export type Gender = 'femelle' | 'male' | 'non-binaire';
export type MeetPreference = 'femelle' | 'male' | 'tout';

export interface UserProfile {
  movies: [string, string];
  songs: [string, string];
  eyeColor: string;
  hairColor: string;
  height: number;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface User {
  id: string;
  displayName: string;
  age: number;
  gender: Gender;
  meetPreference: MeetPreference;
  birthDate: string;
  animal: Animal;
  profile: UserProfile;
  bio?: string;
  city?: string;
  location?: GeoPoint;
  ageRange?: AgeRange;
  distanceKm?: number;
  paused?: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}
