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

  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') ?? '';

    this.loadConversation();

    this.sub = this.chatService.conversations$.subscribe(() => {
      this.loadConversation();
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ionViewWillEnter(): void {
    this.chatService.markAsRead(this.conversationId);
    this.scrollToBottom();
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
    this.chatService.sendMessage(this.conversationId, this.draft);
    this.draft = '';
    setTimeout(() => this.scrollToBottom(), 50);
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

  private loadConversation(): void {
    const conv = this.chatService.getById(this.conversationId);
    if (!conv) {
      this.router.navigate(['/chats']);
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
