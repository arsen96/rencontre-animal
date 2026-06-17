import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
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
}
