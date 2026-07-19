import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
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

  logout() {
    return signOut(this.auth);
  }

  /**
   * Ré-authentifie l'utilisateur courant pour obtenir une connexion "récente"
   * (nécessaire avant une suppression de compte — auth/requires-recent-login).
   * Ne gère automatiquement que le fournisseur Google ; pour les autres, c'est
   * un no-op et la suppression sera tentée directement.
   */
  async reauthenticate(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté.');
    }

    const providerId = user.providerData?.[0]?.providerId;
    if (providerId !== 'google.com') {
      return;
    }

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

  /** Supprime le compte Firebase Auth de l'utilisateur courant. */
  async deleteCurrentUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté.');
    }
    await deleteUser(user);
  }
}
