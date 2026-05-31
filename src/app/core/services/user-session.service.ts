import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OnboardingState } from '../interfaces/onboarding.interface';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private readonly onboardingSubject = new BehaviorSubject<OnboardingState>({});
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly onboarding$ = this.onboardingSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

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

  buildUserFromOnboarding(displayName = 'Explorateur·rice'): User | null {
    const o = this.onboarding;
    if (
      !o.birthDay ||
      !o.birthMonth ||
      !o.birthYear ||
      !o.gender ||
      !o.meetPreference ||
      !o.selectedAnimal ||
      o.profile?.height == null
    ) {
      return null;
    }

    const birthDate = `${o.birthYear}-${String(o.birthMonth).padStart(2, '0')}-${String(o.birthDay).padStart(2, '0')}`;
    const age = this.computeAge(o.birthYear, o.birthMonth, o.birthDay);

    const user: User = {
      id: 'current-user',
      displayName,
      age,
      gender: o.gender,
      meetPreference: o.meetPreference,
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
    };

    this.setCurrentUser(user);
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
