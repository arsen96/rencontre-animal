import { User } from '../interfaces/user.interface';

export function resolveAge(user: User): number | null {
  if (typeof user.age === 'number' && !Number.isNaN(user.age)) {
    return user.age;
  }

  if (!user.birthDate) {
    return null;
  }

  const [year, month, day] = user.birthDate.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }

  return age;
}

export function isProfileComplete(user: User): boolean {
  return !!(
    user.birthDate &&
    user.gender &&
    user.animal?.id &&
    user.profile?.height &&
    user.city?.trim()
  );
}

export function isDiscoverableProfile(user: User): boolean {
  return !user.paused && isProfileComplete(user) && resolveAge(user) !== null;
}

export function normalizeUser(user: User): User {
  const age = resolveAge(user);
  return age === null ? user : { ...user, age };
}

export function onboardingRouteFor(user: User | null): string {
  if (!user?.animal?.id) {
    return '/personality-quiz';
  }
  if (!user.birthDate || !user.gender) {
    return '/birthdate';
  }
  if (!user.profile?.height || !user.city?.trim()) {
    return '/profile-create';
  }
  return '/tabs/my-card';
}
