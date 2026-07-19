import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { UserDataService } from './user-data.service';
import { UserSessionService } from './user-session.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(
    private readonly auth: AuthService,
    private readonly userData: UserDataService,
    private readonly session: UserSessionService,
    private readonly chatService: ChatService
  ) {}

  /**
   * Met le compte en pause ou le réactive. En pause, le profil n'apparaît plus
   * dans la découverte (swipe) ni dans les likes reçus des autres utilisateurs.
   */
  async setPaused(paused: boolean): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) {
      throw new Error('Aucun utilisateur connecté.');
    }

    await this.userData.updateUser(uid, { paused });

    const current = this.session.currentUser;
    if (current) {
      this.session.setCurrentUser({ ...current, paused });
    }
  }

  /**
   * Supprime définitivement le compte : ré-authentification (Google) puis
   * données Firestore, puis compte Firebase Auth, et vide la session locale.
   *
   * Ordre important : la ré-authentification sert de "garde" — si elle échoue
   * ou est annulée, rien n'est supprimé. En cas d'échec de la suppression Auth
   * après coup, on force la déconnexion pour éviter un état "zombie"
   * (connecté mais sans profil, qui renverrait vers l'onboarding).
   */
  async deleteAccount(): Promise<void> {
    await this.auth.reauthenticate();

    const uid = this.auth.uid;
    if (uid) {
      try {
        await this.userData.deleteUserData(uid);
      } catch (error) {
        console.error('Failed to delete Firestore user data', error);
      }
    }

    try {
      await this.auth.deleteCurrentUser();
    } catch (error) {
      try {
        await this.auth.logout();
      } catch {
        // Ignore : on nettoie quand même la session locale ci-dessous.
      }
      this.session.reset();
      this.chatService.clear();
      throw error;
    }

    this.session.reset();
    this.chatService.clear();
  }
}
