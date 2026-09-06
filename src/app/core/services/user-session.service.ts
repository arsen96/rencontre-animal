import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Animal } from '../interfaces/animal.interface';
import { OnboardingState } from '../interfaces/onboarding.interface';
import { AgeRange, GeoPoint, User, UserProfile } from '../interfaces/user.interface';
import { resolveCityCoordinates } from '../utils/distance.util';
import { AuthService } from './auth.service';
import { UserDataService } from './user-data.service';
import { normalizeUser } from '../utils/user.utils';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private readonly onboardingSubject = new BehaviorSubject<OnboardingState>({});
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly onboarding$ = this.onboardingSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly auth: AuthService,
    private readonly userData: UserDataService
  ) {}

  get onboarding(): OnboardingState {
    return this.onboardingSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  patchOnboarding(patch: Partial<OnboardingState>): void {
    this.onboardingSubject.next({ ...this.onboarding, ...patch });
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  updateProfile(patch: {
    displayName?: string;
    bio?: string;
    city?: string;
    location?: GeoPoint | null;
    profile?: Partial<UserProfile>;
    ageRange?: AgeRange;
  }): User | null {
    const current = this.currentUser;
    if (!current) {
      return null;
    }

    const city =
      patch.city !== undefined ? patch.city.trim() || undefined : current.city;
    const location =
      patch.location !== undefined
        ? patch.location ?? undefined
        : patch.city !== undefined
          ? resolveCityCoordinates(patch.city) ?? undefined
          : current.location;

    const updated: User = {
      ...current,
      displayName: patch.displayName?.trim() || current.displayName,
      bio: patch.bio?.trim() || undefined,
      city,
      location,
      profile: { ...current.profile, ...patch.profile },
      ageRange: patch.ageRange ?? current.ageRange,
    };

    this.setCurrentUser(updated);
    this.persist(updated);
    return updated;
  }

  updateAnimal(animal: Animal): User | null {
    const current = this.currentUser;
    if (!current) {
      return null;
    }

    const updated: User = { ...current, animal };
    this.setCurrentUser(updated);
    this.persist(updated);
    return updated;
  }

  async restoreFromFirestore(uid: string): Promise<User | null> {
    const user = await this.userData.getUser(uid);
    if (user) {
      const normalized = normalizeUser(user);
      this.setCurrentUser(normalized);
      return normalized;
    }
    return null;
  }

  /** Charge le profil depuis Firestore si la session mémoire est vide (ex. rechargement F5). */
  async ensureCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return normalizeUser(this.currentUser);
    }

    const uid = await this.auth.waitForUid();
    if (!uid) {
      return null;
    }

    return this.restoreFromFirestore(uid);
  }

  private persist(user: User): void {
    const uid = this.auth.uid;
    if (!uid) {
      return;
    }
    this.userData
      .saveUser(uid, user)
      .catch((error) => console.error('Firestore saveUser failed', error));
  }

  buildUserFromOnboarding(displayName = 'Explorateur·rice'): User | null {
    const o = this.onboarding;
    if (
      !o.birthDay ||
      !o.birthMonth ||
      !o.birthYear ||
      !o.gender ||
      !o.selectedAnimal ||
      o.profile?.height == null ||
      !o.city?.trim()
    ) {
      return null;
    }

    const city = o.city.trim();
    const location = o.location ?? resolveCityCoordinates(city) ?? undefined;
    if (!location) {
      return null;
    }

    const birthDate = `${o.birthYear}-${String(o.birthMonth).padStart(2, '0')}-${String(o.birthDay).padStart(2, '0')}`;
    const age = this.computeAge(o.birthYear, o.birthMonth, o.birthDay);

    const user: User = {
      id: this.auth.uid ?? 'current-user',
      displayName,
      age,
      gender: o.gender,
      birthDate,
      animal: o.selectedAnimal,
      profile: {
        movies: [o.profile.movies?.[0] || '—', o.profile.movies?.[1] || '—'],
        songs: [o.profile.songs?.[0] || '—', o.profile.songs?.[1] || '—'],
        eyeColor: o.profile.eyeColor || '—',
        hairColor: o.profile.hairColor || '—',
        height: o.profile.height,
      },
      bio: o.bio?.trim() || undefined,
      city,
      location,
      quizAnswers: o.quizAnswers,
      quizScores: o.quizScores,
      totemAssignedAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    this.persist(user);
    return user;
  }

  reset(): void {
    this.onboardingSubject.next({});
    this.currentUserSubject.next(null);
  }

  private computeAge(year: number, month: number, day: number): number {
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  }
}
