import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Conversation } from '../../core/interfaces/conversation.interface';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: false,
})
export class ChatsPage implements OnInit, OnDestroy, ViewWillEnter {
  conversations: Conversation[] = [];
  private sub?: Subscription;

  constructor(
    private readonly chatService: ChatService,
    private readonly session: UserSessionService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.chatService.conversations$.subscribe((list) => {
      this.conversations = list;
    });
  }

  ionViewWillEnter(): void {
    void this.syncChats();
  }

  private async syncChats(): Promise<void> {
    const user = await this.session.ensureCurrentUser();
    if (!user) {
      this.router.navigate(['/landing']);
      return;
    }
    await this.chatService.syncFromFirestore(user.id);
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
    return this.chatService.getPreview(conversation);
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
