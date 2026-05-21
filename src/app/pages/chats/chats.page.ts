import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Conversation } from '../../core/interfaces/conversation.interface';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: false,
})
export class ChatsPage implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  private sub?: Subscription;

  constructor(
    private readonly chatService: ChatService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.chatService.conversations$.subscribe((list) => {
      this.conversations = list;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isEmpty(): boolean {
    return this.conversations.length === 0;
  }

  openChat(conversation: Conversation): void {
    this.router.navigate(['/chat', conversation.id]);
  }

  backToJungle(): void {
    this.router.navigate(['/jungle']);
  }

  lastPreview(conversation: Conversation): string {
    const last = this.chatService.getLastMessage(conversation);
    return last?.text ?? '';
  }

  lastTime(conversation: Conversation): string {
    const last = this.chatService.getLastMessage(conversation);
    if (!last) {
      return '';
    }
    const d = last.sentAt;
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
