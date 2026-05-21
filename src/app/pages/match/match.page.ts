import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Match } from '../../core/interfaces/match.interface';
import { ChatService } from '../../core/services/chat.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
  standalone: false,
})
export class MatchPage implements OnInit {
  match: Match | null = null;
  currentAnimalEmoji = '🦁';

  constructor(
    private readonly router: Router,
    private readonly session: UserSessionService,
    private readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    this.match = nav?.extras?.state?.['match'] ?? history.state?.['match'] ?? null;
    this.currentAnimalEmoji = this.session.currentUser?.animal.emoji ?? '🦁';

    if (!this.match) {
      this.router.navigate(['/jungle']);
    }
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
}
