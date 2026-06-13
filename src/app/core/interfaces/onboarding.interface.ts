import { Animal } from './animal.interface';
import { Gender, MeetPreference, GeoPoint, UserProfile } from './user.interface';

export interface OnboardingState {
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  gender?: Gender;
  meetPreference?: MeetPreference;
  selectedAnimal?: Animal;
  profile?: Partial<UserProfile>;
  bio?: string;
  city?: string;
  location?: GeoPoint;
}
