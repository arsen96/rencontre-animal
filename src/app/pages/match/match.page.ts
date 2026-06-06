import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Animal } from '../../core/interfaces/animal.interface';
import { Match } from '../../core/interfaces/match.interface';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { SwipeDataService } from '../../core/services/swipe-data.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
  standalone: false,
})
export class MatchPage implements OnInit {
  match: Match | null = null;
  currentAnimal?: Animal;

  constructor(
    private readonly router: Router,
    private readonly session: UserSessionService,
    private readonly chatService: ChatService,
    private readonly swipeData: SwipeDataService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    this.match = nav?.extras?.state?.['match'] ?? history.state?.['match'] ?? null;
    this.currentAnimal = this.session.currentUser?.animal;

    if (!this.match) {
      this.router.navigate(['/jungle']);
      return;
    }

    this.chatService.ensureConversation(this.match);
    void this.markSeen();
  }

  continueSwiping(): void {
    this.router.navigate(['/jungle']);
  }

  openChat(): void {
    if (!this.match) {
      return;
    }
    let conversationId = this.match.conversationId;
    if (!conversationId) {
      const conv = this.chatService.createFromMatch(this.match);
      conversationId = conv.id;
    }
    this.router.navigate(['/chat', conversationId]);
  }

  private async markSeen(): Promise<void> {
    const uid = this.auth.uid;
    if (!uid || !this.match) {
      return;
    }

    try {
      await this.swipeData.markMatchSeen(uid, this.match.id);
    } catch (error) {
      console.error('Failed to mark match as seen', error);
    }
  }
}
