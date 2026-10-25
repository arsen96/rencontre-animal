import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  revokeAccessToken,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  UserCredential,
} from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly authState$: Observable<FirebaseUser | null>;

  constructor(private readonly auth: Auth) {
    this.authState$ = authState(this.auth);
  }

  get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  /** Attend que Firebase Auth soit initialisé (important au rechargement de page). */
  waitForUid(): Promise<string | null> {
    const existing = this.auth.currentUser?.uid;
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user?.uid ?? null);
      });
    });
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle(): Promise<UserCredential> {
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) {
        throw new Error('Connexion Google annulée ou token manquant.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(this.auth, credential);
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(this.auth, provider);
  }

  /**
   * Sign in with Apple — required on iOS when a third-party login (Google) is offered.
   * Existing email/Google accounts are unchanged; Apple creates/links its own Firebase uid.
   */
  async loginWithApple(): Promise<UserCredential> {
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithApple({
        skipNativeAuth: true,
        scopes: ['email', 'name'],
      });
      const idToken = result.credential?.idToken;
      if (!idToken || !result.credential?.nonce) {
        throw new Error('Réponse Apple invalide : jeton ou nonce manquant.');
      }
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken,
        rawNonce: result.credential?.nonce,
      });
      return signInWithCredential(this.auth, credential);
    }

    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    return signOut(this.auth);
  }

  /**
   * Ré-authentifie l'utilisateur courant pour obtenir une connexion "récente"
   * (nécessaire avant une suppression de compte — auth/requires-recent-login).
   * Gère Google et Apple ; email/password reste un no-op (tentative directe).
   * revokeAppleToken est réservé au parcours de suppression de compte.
   */
  async reauthenticate(revokeAppleToken = false): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté.');
    }

    const providerId = user.providerData?.[0]?.providerId;
    if (providerId === 'google.com') {
      await this.reauthenticateGoogle(user);
      return;
    }
    if (providerId === 'apple.com') {
      await this.reauthenticateApple(user, revokeAppleToken);
      return;
    }
  }

  /** Supprime le compte Firebase Auth de l'utilisateur courant. */
  async deleteCurrentUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté.');
    }
    await deleteUser(user);
  }

  private async reauthenticateGoogle(user: FirebaseUser): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) {
        throw new Error('Ré-authentification Google annulée.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      await reauthenticateWithCredential(user, credential);
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await reauthenticateWithPopup(user, provider);
  }

  private async reauthenticateApple(user: FirebaseUser, revokeToken = false): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Firebase iOS revokeToken needs a native currentUser. Ordinary sign-in
      // keeps skipNativeAuth=true; only account deletion opens a native session.
      const nativeRevocation = revokeToken && Capacitor.getPlatform() === 'ios';
      try {
        const result = await FirebaseAuthentication.signInWithApple({
          skipNativeAuth: !nativeRevocation,
          scopes: ['email', 'name'],
        });
        const idToken = result.credential?.idToken;
        if (!idToken || !result.credential?.nonce) {
          throw new Error('Réponse Apple invalide : jeton ou nonce manquant.');
        }
        if (nativeRevocation && result.user?.uid !== user.uid) {
          throw new Error('Le compte Apple sélectionné ne correspond pas au compte à supprimer.');
        }
        const token = nativeRevocation
          ? result.credential.authorizationCode
          : result.credential.accessToken;
        if (revokeToken && !token) {
          throw new Error('Impossible de révoquer Apple : code ou jeton manquant.');
        }
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({ idToken, rawNonce: result.credential.nonce });
        await reauthenticateWithCredential(user, credential);
        if (revokeToken && token) {
          if (nativeRevocation) {
            await FirebaseAuthentication.revokeAccessToken({ token });
          } else {
            await revokeAccessToken(this.auth, token);
          }
        }
      } finally {
        if (nativeRevocation) {
          await FirebaseAuthentication.signOut();
        }
      }
      return;
    }

    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await reauthenticateWithPopup(user, provider);
    if (revokeToken) {
      const token = OAuthProvider.credentialFromResult(result)?.accessToken;
      if (!token) {
        throw new Error('Impossible de révoquer Apple : jeton manquant.');
      }
      await revokeAccessToken(this.auth, token);
    }
  }
}
