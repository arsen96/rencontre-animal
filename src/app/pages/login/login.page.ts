import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UserDataService } from '../../core/services/user-data.service';
import { UserSessionService } from '../../core/services/user-session.service';

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

  private async routeAfterAuth(uid: string): Promise<void> {
    let profile = null;
    try {
      profile = await this.userData.getUser(uid);
    } catch (error: unknown) {
      console.error('Firestore getUser failed (on continue malgré tout)', error);
    }

    if (profile) {
      this.session.setCurrentUser(profile);
      this.router.navigate(['/jungle']);
    } else {
      this.router.navigate(['/birthdate']);
    }
  }

  private mapError(code?: string): string {
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
      default:
        return 'Une erreur est survenue. Réessaie.';
    }
  }
}
