import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { buildWelcomeMessages } from '../data/mock-chat-seeds.data';
import { Conversation } from '../interfaces/conversation.interface';
import { ChatMessage } from '../interfaces/message.interface';
import { Match } from '../interfaces/match.interface';
import { User } from '../interfaces/user.interface';

const CURRENT_USER_ID = 'current-user';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly conversationsSubject = new BehaviorSubject<Conversation[]>([]);

  readonly conversations$ = this.conversationsSubject.asObservable();

  readonly totalUnread$ = this.conversations$.pipe(
    map((list) => list.reduce((sum, c) => sum + c.unreadCount, 0))
  );

  get conversations(): Conversation[] {
    return this.conversationsSubject.value;
  }

  get totalUnread(): number {
    return this.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }

  /** Crée automatiquement une conversation symétrique à chaque match */
  createFromMatch(match: Match): Conversation {
    const existing = this.conversations.find((c) => c.matchId === match.id);
    if (existing) {
      return existing;
    }

    const conversationId = `conv-${match.id}`;
    const welcomeMessages = buildWelcomeMessages(conversationId, match.user);

    const conversation: Conversation = {
      id: conversationId,
      matchId: match.id,
      participant: match.user,
      messages: [...welcomeMessages],
      createdAt: new Date(match.matchedAt),
      updatedAt: welcomeMessages[welcomeMessages.length - 1]?.sentAt ?? new Date(),
      unreadCount: welcomeMessages.length,
    };

    this.conversationsSubject.next([conversation, ...this.conversations]);
    return conversation;
  }

  getById(conversationId: string): Conversation | undefined {
    return this.conversations.find((c) => c.id === conversationId);
  }

  getByMatchId(matchId: string): Conversation | undefined {
    return this.conversations.find((c) => c.matchId === matchId);
  }

  markAsRead(conversationId: string): void {
    const list = this.conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    );
    this.conversationsSubject.next(list);
  }

  sendMessage(conversationId: string, text: string): ChatMessage | null {
    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }

    const index = this.conversations.findIndex((c) => c.id === conversationId);
    if (index < 0) {
      return null;
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text: trimmed,
      sentAt: new Date(),
    };

    const updated: Conversation = {
      ...this.conversations[index],
      messages: [...this.conversations[index].messages, message],
      updatedAt: message.sentAt,
    };

    const list = [...this.conversations];
    list[index] = updated;
    list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    this.conversationsSubject.next(list);
    return message;
  }

  isFromCurrentUser(message: ChatMessage): boolean {
    return message.senderId === CURRENT_USER_ID;
  }

  getLastMessage(conversation: Conversation): ChatMessage | undefined {
    return conversation.messages[conversation.messages.length - 1];
  }

  getParticipantLabel(user: User): string {
    return user.displayName;
  }
}
