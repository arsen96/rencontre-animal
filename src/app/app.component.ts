import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ChatService } from './core/services/chat.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { UserSessionService } from './core/services/user-session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private readonly auth: AuthService,
    private readonly session: UserSessionService,
    private readonly chatService: ChatService,
    private readonly pushNotifications: PushNotificationService
  ) {
    this.auth.authState$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        if (!this.session.currentUser) {
          void this.session.restoreFromFirestore(firebaseUser.uid);
        }
        void this.pushNotifications.initForUser(firebaseUser.uid);
        return;
      }

      const previousUid = this.session.currentUser?.id;
      if (previousUid) {
        void this.pushNotifications.clearForUser(previousUid);
        void this.chatService.clearPresence(previousUid);
      }
      this.session.reset();
      this.chatService.clear();
    });
  }
}
