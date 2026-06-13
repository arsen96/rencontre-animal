import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import {
  Firestore,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import {
  PushActionPerformed,
  PushNotifications,
  PushToken,
} from '../native/push-notifications.plugin';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private initializedForUid: string | null = null;
  private currentToken: string | null = null;
  private listenersAttached = false;

  constructor(
    private readonly firestore: Firestore,
    private readonly router: Router,
    private readonly injector: EnvironmentInjector
  ) {}

  async initForUser(uid: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (this.initializedForUid === uid && this.currentToken) {
      return;
    }

    if (this.initializedForUid && this.initializedForUid !== uid) {
      await this.clearForUser(this.initializedForUid);
    }

    this.attachListeners(uid);

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      return;
    }

    await PushNotifications.register();
    this.initializedForUid = uid;
  }

  async clearForUser(uid: string): Promise<void> {
    if (this.currentToken) {
      try {
        await runInInjectionContext(this.injector, () =>
          deleteDoc(
            doc(
              this.firestore,
              'users',
              uid,
              'fcmTokens',
              this.tokenDocId(this.currentToken!)
            )
          )
        );
      } catch (error) {
        console.error('Failed to remove FCM token', error);
      }
    }

    if (this.initializedForUid === uid) {
      this.initializedForUid = null;
      this.currentToken = null;
    }
  }

  private attachListeners(uid: string): void {
    if (this.listenersAttached) {
      return;
    }

    this.listenersAttached = true;

    void PushNotifications.addListener('registration', (token: PushToken) => {
      void this.saveToken(uid, token.value);
    });

    void PushNotifications.addListener('registrationError', (error: unknown) => {
      console.error('Push registration failed', error);
    });

    void PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: PushActionPerformed) => {
        this.handleNotificationTap(action);
      }
    );
  }

  private async saveToken(uid: string, token: string): Promise<void> {
    this.currentToken = token;

    try {
      await runInInjectionContext(this.injector, () =>
        setDoc(
          doc(this.firestore, 'users', uid, 'fcmTokens', this.tokenDocId(token)),
          {
            token,
            platform: Capacitor.getPlatform(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      );
    } catch (error) {
      console.error('Failed to save FCM token', error);
    }
  }

  private handleNotificationTap(action: PushActionPerformed): void {
    const conversationId = action.notification.data?.['conversationId'];
    if (!conversationId) {
      return;
    }

    void this.router.navigate(['/chat', conversationId]);
  }

  private tokenDocId(token: string): string {
    return token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 120);
  }
}
