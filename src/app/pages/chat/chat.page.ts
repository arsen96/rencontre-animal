import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Animal } from '../../core/interfaces/animal.interface';
import { Conversation } from '../../core/interfaces/conversation.interface';
import { ChatMessage } from '../../core/interfaces/message.interface';
import { ChatService } from '../../core/services/chat.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false,
})
export class ChatPage implements OnInit, OnDestroy, ViewWillEnter {
  @ViewChild(IonContent) content?: IonContent;

  conversation?: Conversation;
  messages: ChatMessage[] = [];
  draft = '';
  conversationId = '';
  loading = true;

  private sub?: Subscription;
  private bootstrapped = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly session: UserSessionService,
    readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') ?? '';

    this.sub = this.chatService.conversations$.subscribe(() => {
      if (!this.bootstrapped) {
        return;
      }
      this.loadConversation(false);
      this.scrollToBottom();
    });
  }

  ionViewWillEnter(): void {
    void this.bootstrapChat();
  }

  ngOnDestroy(): void {
    this.chatService.setActiveConversation(null);
    this.chatService.unsubscribeFromMessages(this.conversationId);
    this.sub?.unsubscribe();
  }

  get participantName(): string {
    return this.conversation?.participant.displayName ?? '';
  }

  get participantAnimal(): Animal | undefined {
    return this.conversation?.participant.animal;
  }

  isMine(message: ChatMessage): boolean {
    return this.chatService.isFromCurrentUser(message);
  }

  send(): void {
    if (!this.draft.trim() || !this.conversationId) {
      return;
    }

    void this.chatService.sendMessage(this.conversationId, this.draft).then((message) => {
      if (message) {
        this.draft = '';
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  goBack(): void {
    this.router.navigate(['/chats']);
  }

  private async bootstrapChat(): Promise<void> {
    this.loading = true;

    const user = await this.session.ensureCurrentUser();
    if (!user) {
      this.router.navigate(['/landing']);
      return;
    }

    await this.chatService.syncFromFirestore(user.id);

    const conv = this.chatService.getById(this.conversationId);
    if (!conv) {
      this.router.navigate(['/chats']);
      return;
    }

    this.bootstrapped = true;
    this.chatService.setActiveConversation(this.conversationId);
    this.chatService.subscribeToMessages(conv.matchId, conv.id);
    this.loadConversation(false);
    this.loading = false;
    this.scrollToBottom();
  }

  private loadConversation(redirectIfMissing = true): void {
    const conv = this.chatService.getById(this.conversationId);
    if (!conv) {
      if (redirectIfMissing) {
        this.router.navigate(['/chats']);
      }
      return;
    }

    this.conversation = conv;
    this.messages = [...conv.messages];
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 80);
  }
}
