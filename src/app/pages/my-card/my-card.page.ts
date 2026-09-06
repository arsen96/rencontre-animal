import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { User } from '../../core/interfaces/user.interface';
import { AnimalService } from '../../core/services/animal.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { isProfileComplete } from '../../core/utils/user.utils';

@Component({
  selector: 'app-my-card',
  templateUrl: './my-card.page.html',
  styleUrls: ['./my-card.page.scss'],
  standalone: false,
})
export class MyCardPage implements OnInit, OnDestroy {
  user: User | null = null;
  flipped = false;
  unreadChats = 0;
  private sub?: Subscription;
  private flipTimer?: number;

  constructor(
    private readonly session: UserSessionService,
    private readonly animalService: AnimalService,
    private readonly auth: AuthService,
    private readonly chatService: ChatService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.auth.authState$,
      this.session.currentUser$,
      this.animalService.animals$,
      this.chatService.totalUnread$,
    ]).subscribe(([firebaseUser, user, , unread]) => {
      this.unreadChats = unread;
      if (user) {
        this.user = this.animalService.enrichUser(user);
        if (!this.flipped) {
          this.flipTimer = window.setTimeout(() => (this.flipped = true), 280);
        }
        return;
      }
      if (firebaseUser === null) {
        void this.router.navigate(['/landing']);
      }
    });

    void this.bootstrap();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.flipTimer) {
      window.clearTimeout(this.flipTimer);
    }
  }

  retakeQuiz(): void {
    void this.router.navigate(['/personality-quiz'], { queryParams: { retake: 1 } });
  }

  openProfile(): void {
    void this.router.navigate(['/user-profile']);
  }

  openChats(): void {
    void this.router.navigate(['/chats']);
  }

  private async bootstrap(): Promise<void> {
    const user = await this.session.ensureCurrentUser();
    if (!user) {
      void this.router.navigate(['/landing']);
      return;
    }
    if (!isProfileComplete(user)) {
      void this.router.navigate([user.animal?.id ? '/profile-create' : '/personality-quiz']);
    }
  }
}
