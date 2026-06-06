import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
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
    private readonly session: UserSessionService
  ) {
    this.auth.authState$.subscribe((firebaseUser) => {
      if (firebaseUser && !this.session.currentUser) {
        void this.session.restoreFromFirestore(firebaseUser.uid);
      }
      if (!firebaseUser) {
        this.session.reset();
      }
    });
  }
}
