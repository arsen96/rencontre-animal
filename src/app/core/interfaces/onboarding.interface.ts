import { Animal } from './animal.interface';
import { Gender, GeoPoint, UserProfile } from './user.interface';

export interface OnboardingState {
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  gender?: Gender;
  selectedAnimal?: Animal;
  quizAnswers?: Record<string, string>;
  quizScores?: Record<string, number>;
  profile?: Partial<UserProfile>;
  bio?: string;
  city?: string;
  location?: GeoPoint;
}
