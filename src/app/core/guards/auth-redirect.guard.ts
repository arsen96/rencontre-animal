import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserDataService } from '../services/user-data.service';
import { UserSessionService } from '../services/user-session.service';
import {
  isProfileComplete,
  normalizeUser,
  onboardingRouteFor,
} from '../utils/user.utils';

/**
 * Redirige un utilisateur déjà connecté loin des pages d'accueil/login,
 * avant le rendu, pour éviter tout affichage transitoire de ces pages.
 */
export const authRedirectGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const userData = inject(UserDataService);
  const session = inject(UserSessionService);
  const router = inject(Router);

  const firebaseUser = await firstValueFrom(auth.authState$.pipe(take(1)));
  if (!firebaseUser) {
    return true;
  }

  let profile = null;
  try {
    profile = await userData.getUser(firebaseUser.uid);
  } catch (error: unknown) {
    console.error('authRedirectGuard getUser failed', error);
  }

  if (profile) {
    const user = normalizeUser(profile);
    session.setCurrentUser(user);
    const route = isProfileComplete(user) ? '/jungle' : onboardingRouteFor(user);
    return router.createUrlTree([route]);
  }

  return router.createUrlTree(['/birthdate']);
};
