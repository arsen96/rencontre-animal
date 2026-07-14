import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ViewWillEnter } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
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
  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;

  conversation?: Conversation;
  messages: ChatMessage[] = [];
  draft = '';
  conversationId = '';
  loading = true;
  uploadingPhoto = false;
  photoError = '';

  private sub?: Subscription;
  private bootstrapped = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly session: UserSessionService,
    readonly chatService: ChatService,
    private readonly translate: TranslateService
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

  isNewDay(index: number): boolean {
    if (this.messages.length === 0) {
      return false;
    }
    if (index === 0) {
      return true;
    }
    return !this.isSameCalendarDay(
      this.messages[index - 1].sentAt,
      this.messages[index].sentAt
    );
  }

  dayLabel(sentAt: Date): string {
    const date = this.toDate(sentAt);
    const now = new Date();

    if (this.isSameCalendarDay(date, now)) {
      return this.translate.instant('chat.dateToday');
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (this.isSameCalendarDay(date, yesterday)) {
      return this.translate.instant('chat.dateYesterday');
    }

    const locale = this.translate.getCurrentLang() === 'en' ? 'en-GB' : 'fr-FR';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString(locale, options);
  }

  get canRequestPhotos(): boolean {
    return !!this.conversation && this.chatService.canRequestPhotoSharing(this.conversation);
  }

  get hasPendingPhotoRequestFromMe(): boolean {
    return !!this.conversation && this.chatService.hasPendingPhotoRequestFromMe(this.conversation);
  }

  get canRespondToPhotoRequest(): boolean {
    return !!this.conversation && this.chatService.canRespondToPhotoRequest(this.conversation);
  }

  get photosEnabled(): boolean {
    return !!this.conversation?.photosEnabled;
  }

  requestPhotoSharing(): void {
    if (!this.conversationId) {
      return;
    }

    void this.chatService.requestPhotoSharing(this.conversationId);
  }

  acceptPhotoSharing(): void {
    if (!this.conversationId) {
      return;
    }

    void this.chatService.respondToPhotoRequest(this.conversationId, true);
  }

  declinePhotoSharing(): void {
    if (!this.conversationId) {
      return;
    }

    void this.chatService.respondToPhotoRequest(this.conversationId, false);
  }

  openPhotoPicker(): void {
    this.photoError = '';
    this.photoInput?.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file || !this.conversationId) {
      return;
    }

    this.uploadingPhoto = true;
    this.photoError = '';

    void this.chatService
      .sendImageMessage(this.conversationId, file)
      .then((message) => {
        if (message) {
          setTimeout(() => this.scrollToBottom(), 50);
        } else {
          this.photoError = this.translate.instant('chat.sendPhotoError');
        }
      })
      .catch((error: unknown) => {
        this.photoError =
          error instanceof Error ? error.message : this.translate.instant('chat.sendPhotoError');
      })
      .finally(() => {
        this.uploadingPhoto = false;
      });
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

  private toDate(value: Date): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private isSameCalendarDay(a: Date, b: Date): boolean {
    const left = this.toDate(a);
    const right = this.toDate(b);
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
