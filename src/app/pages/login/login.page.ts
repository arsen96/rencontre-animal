import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { UserDataService } from '../../core/services/user-data.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { openExternalUrl } from '../../core/utils/open-external-url.util';
import {
  isProfileComplete,
  normalizeUser,
  onboardingRouteFor,
} from '../../core/utils/user.utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';
  checkingSession = true;
  readonly privacyPolicyUrl = environment.privacyPolicyUrl;

  constructor(
    private readonly auth: AuthService,
    private readonly userData: UserDataService,
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.auth.authState$.pipe(take(1)).subscribe(async (firebaseUser) => {
      if (!firebaseUser) {
        this.checkingSession = false;
        return;
      }

      await this.routeAfterAuth(firebaseUser.uid);
      this.checkingSession = false;
    });
  }

  get isLogin(): boolean {
    return this.mode === 'login';
  }

  get canSubmit(): boolean {
    return !this.loading && this.email.trim().length > 0 && this.password.length >= 6;
  }

  toggleMode(): void {
    this.mode = this.isLogin ? 'register' : 'login';
    this.error = '';
  }

  openPrivacyPolicy(): void {
    openExternalUrl(this.privacyPolicyUrl);
  }

  onEmailInput(event: Event): void {
    this.email = (event as CustomEvent<{ value?: string }>).detail?.value ?? '';
  }

  onPasswordInput(event: Event): void {
    this.password = (event as CustomEvent<{ value?: string }>).detail?.value ?? '';
  }

  async submit(): Promise<void> {
    if (!this.canSubmit) {
      return;
    }

    this.loading = true;
    this.error = '';

    let uid: string;
    try {
      if (this.mode === 'register') {
        const credential = await this.auth.register(this.email.trim(), this.password);
        uid = credential.user.uid;
      } else {
        const credential = await this.auth.login(this.email.trim(), this.password);
        uid = credential.user.uid;
      }
    } catch (error: unknown) {
      console.error('Auth error', error);
      this.error = this.mapError((error as { code?: string })?.code);
      this.loading = false;
      return;
    }

    await this.routeAfterAuth(uid);
    this.loading = false;
  }

  async googleLogin(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';

    let uid: string;
    try {
      const credential = await this.auth.loginWithGoogle();
      uid = credential.user.uid;
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message ?? '';
      const cancelled =
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        message.includes('annulée');
      if (!cancelled) {
        console.error('Google auth error', error);
        this.error = this.mapError(code, message);
      }
      this.loading = false;
      return;
    }

    await this.routeAfterAuth(uid);
    this.loading = false;
  }

  private async routeAfterAuth(uid: string): Promise<void> {
    let profile = null;
    try {
      profile = await this.userData.getUser(uid);
    } catch (error: unknown) {
      console.error('Firestore getUser failed (on continue malgré tout)', error);
    }

    if (profile) {
      const user = normalizeUser(profile);
      this.session.setCurrentUser(user);
      this.router.navigate([
        isProfileComplete(user) ? '/jungle' : onboardingRouteFor(user),
      ]);
    } else {
      this.router.navigate(['/birthdate']);
    }
  }

  private mapError(code?: string, message?: string): string {
    if (message?.includes('token manquant')) {
      return 'Connexion Google annulée.';
    }
    switch (code) {
      case 'auth/invalid-email':
        return "L'adresse e-mail n'est pas valide.";
      case 'auth/email-already-in-use':
        return 'Ce compte existe déjà. Connecte-toi plutôt.';
      case 'auth/weak-password':
        return 'Mot de passe trop court (6 caractères minimum).';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou mot de passe incorrect.';
      case 'auth/network-request-failed':
        return 'Problème de connexion réseau.';
      case 'auth/popup-blocked':
        return 'La fenêtre Google a été bloquée par le navigateur.';
      case 'auth/account-exists-with-different-credential':
        return 'Un compte existe déjà avec cet e-mail (autre méthode de connexion).';
      default:
        return 'Une erreur est survenue. Réessaie.';
    }
  }
}
