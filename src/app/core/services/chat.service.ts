import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  Unsubscribe,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject, map } from 'rxjs';
import { Conversation } from '../interfaces/conversation.interface';
import { ChatMessage } from '../interfaces/message.interface';
import { Match } from '../interfaces/match.interface';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';
import { UserDataService } from './user-data.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private readonly messageListeners = new Map<string, Unsubscribe>();
  private conversationsListener: Unsubscribe | null = null;
  private listeningForUid: string | null = null;
  private activeConversationId: string | null = null;

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

  constructor(
    private readonly auth: AuthService,
    private readonly userData: UserDataService,
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector
  ) {}

  setActiveConversation(conversationId: string | null): void {
    this.activeConversationId = conversationId;
    if (conversationId) {
      this.markAsRead(conversationId);
    }
  }

  async syncFromFirestore(currentUid: string): Promise<void> {
    try {
      const snapshot = await runInInjectionContext(this.injector, () =>
        getDocs(
          query(
            collection(this.firestore, 'conversations'),
            where('userIds', 'array-contains', currentUid)
          )
        )
      );

      const localById = new Map(this.conversations.map((c) => [c.id, c]));
      const synced: Conversation[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const matchId = (data['matchId'] as string) ?? docSnap.id;
        const conversationId = `conv-${matchId}`;
        const otherUid = (data['userIds'] as string[]).find((id) => id !== currentUid);
        if (!otherUid) {
          continue;
        }

        const participant = await this.userData.getUser(otherUid);
        if (!participant) {
          continue;
        }

        const existing = localById.get(conversationId);
        const createdAtRaw = data['createdAt'];
        const updatedAtRaw = data['updatedAt'];
        const createdAt =
          createdAtRaw && typeof createdAtRaw.toDate === 'function'
            ? createdAtRaw.toDate()
            : existing?.createdAt ?? new Date();
        const updatedAt =
          updatedAtRaw && typeof updatedAtRaw.toDate === 'function'
            ? updatedAtRaw.toDate()
            : existing?.updatedAt ?? createdAt;

        const messages =
          existing?.messages.length
            ? existing.messages
            : await this.loadMessages(matchId, conversationId);

        const unreadCount = this.computeUnreadCount(
          messages,
          currentUid,
          conversationId
        );

        synced.push({
          id: conversationId,
          matchId,
          participant,
          messages,
          createdAt,
          updatedAt,
          unreadCount,
        });
      }

      synced.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      this.conversationsSubject.next(synced);
      this.listenToConversations(currentUid);
    } catch (error) {
      console.error('Failed to sync conversations from Firestore', error);
    }
  }

  private listenToConversations(currentUid: string): void {
    if (this.listeningForUid === currentUid && this.conversationsListener) {
      return;
    }

    this.conversationsListener?.();
    this.listeningForUid = currentUid;

    const conversationsQuery = query(
      collection(this.firestore, 'conversations'),
      where('userIds', 'array-contains', currentUid)
    );

    this.conversationsListener = runInInjectionContext(this.injector, () =>
      onSnapshot(
        conversationsQuery,
        (snapshot) => {
          void this.handleConversationChanges(snapshot.docChanges(), currentUid);
        },
        (error) => {
          console.error('Failed to listen to conversations', error);
        }
      )
    );
  }

  private async handleConversationChanges(
    changes: Array<{ type: string; doc: { id: string; data: () => Record<string, unknown> } }>,
    currentUid: string
  ): Promise<void> {
    for (const change of changes) {
      if (change.type !== 'added' && change.type !== 'modified') {
        continue;
      }

      const matchId = change.doc.id;
      const conversationId = `conv-${matchId}`;
      const existing = this.getById(conversationId);

      if (!existing) {
        await this.syncFromFirestore(currentUid);
        return;
      }

      const messages = await this.loadMessages(matchId, conversationId);
      this.applyMessages(conversationId, messages);
    }
  }

  subscribeToMessages(matchId: string, conversationId: string): void {
    this.unsubscribeFromMessages(conversationId);

    const messagesQuery = query(
      collection(this.firestore, 'conversations', matchId, 'messages'),
      orderBy('sentAt', 'asc')
    );

    const unsubscribe = runInInjectionContext(this.injector, () =>
      onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messages = snapshot.docs.map((docSnap) =>
            this.mapMessage(docSnap.id, docSnap.data(), conversationId)
          );
          this.applyMessages(conversationId, messages);
        },
        (error) => {
          console.error('Failed to listen to messages', error);
        }
      )
    );

    this.messageListeners.set(conversationId, unsubscribe);
  }

  unsubscribeFromMessages(conversationId: string): void {
    const unsubscribe = this.messageListeners.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.messageListeners.delete(conversationId);
    }
  }

  createFromMatch(match: Match): Conversation {
    const conversationId = match.conversationId ?? `conv-${match.id}`;
    const existing = this.conversations.find(
      (c) => c.matchId === match.id || c.id === conversationId
    );
    if (existing) {
      return existing;
    }

    const conversation: Conversation = {
      id: conversationId,
      matchId: match.id,
      participant: match.user,
      messages: [],
      createdAt: new Date(match.matchedAt),
      updatedAt: new Date(match.matchedAt),
      unreadCount: 1,
    };

    void this.persistConversation(match, conversation);

    this.conversationsSubject.next([conversation, ...this.conversations]);
    return conversation;
  }

  ensureConversation(match: Match): Conversation {
    return this.createFromMatch(match);
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

  async sendMessage(conversationId: string, text: string): Promise<ChatMessage | null> {
    const trimmed = text.trim();
    const uid = this.auth.uid;
    if (!trimmed || !uid) {
      return null;
    }

    const index = this.conversations.findIndex((c) => c.id === conversationId);
    if (index < 0) {
      return null;
    }

    const conversation = this.conversations[index];
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId,
      senderId: uid,
      text: trimmed,
      sentAt: new Date(),
    };

    try {
      await this.persistMessage(conversation.matchId, message);
    } catch (error) {
      console.error('Failed to persist message', error);
      return null;
    }

    const updated: Conversation = {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: message.sentAt,
      unreadCount: 0,
    };

    const list = [...this.conversations];
    list[index] = updated;
    list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    this.conversationsSubject.next(list);

    return message;
  }

  isFromCurrentUser(message: ChatMessage): boolean {
    const uid = this.auth.uid;
    return !!uid && message.senderId === uid;
  }

  getLastMessage(conversation: Conversation): ChatMessage | undefined {
    return conversation.messages[conversation.messages.length - 1];
  }

  getParticipantLabel(user: User): string {
    return user.displayName;
  }

  getPreview(conversation: Conversation): string {
    const last = this.getLastMessage(conversation);
    if (last?.text) {
      return last.text;
    }
    return 'Nouveau match — dis bonjour !';
  }

  clear(): void {
    this.conversationsListener?.();
    this.conversationsListener = null;
    this.listeningForUid = null;
    for (const conversationId of this.messageListeners.keys()) {
      this.unsubscribeFromMessages(conversationId);
    }
    this.activeConversationId = null;
    this.conversationsSubject.next([]);
  }

  private async loadMessages(
    matchId: string,
    conversationId: string
  ): Promise<ChatMessage[]> {
    try {
      const snapshot = await runInInjectionContext(this.injector, () =>
        getDocs(
          query(
            collection(this.firestore, 'conversations', matchId, 'messages'),
            orderBy('sentAt', 'asc')
          )
        )
      );

      return snapshot.docs.map((docSnap) =>
        this.mapMessage(docSnap.id, docSnap.data(), conversationId)
      );
    } catch (error) {
      console.error('Failed to load messages', error);
      return [];
    }
  }

  private applyMessages(conversationId: string, messages: ChatMessage[]): void {
    const uid = this.auth.uid;
    const list = this.conversations.map((c) => {
      if (c.id !== conversationId) {
        return c;
      }

      const updatedAt = messages[messages.length - 1]?.sentAt ?? c.updatedAt;
      const unreadCount =
        this.activeConversationId === conversationId
          ? 0
          : this.computeUnreadCount(messages, uid, conversationId);

      return {
        ...c,
        messages,
        updatedAt,
        unreadCount,
      };
    });

    list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    this.conversationsSubject.next(list);
  }

  private computeUnreadCount(
    messages: ChatMessage[],
    currentUid: string | null,
    conversationId: string
  ): number {
    if (!currentUid || this.activeConversationId === conversationId) {
      return 0;
    }

    const last = messages[messages.length - 1];
    if (!last) {
      return 1;
    }

    return last.senderId !== currentUid ? 1 : 0;
  }

  private mapMessage(
    id: string,
    data: Record<string, unknown>,
    conversationId: string
  ): ChatMessage {
    const sentAtRaw = data['sentAt'];
    const sentAt =
      sentAtRaw && typeof (sentAtRaw as { toDate?: () => Date }).toDate === 'function'
        ? (sentAtRaw as { toDate: () => Date }).toDate()
        : new Date();

    return {
      id,
      conversationId,
      senderId: (data['senderId'] as string) ?? '',
      text: (data['text'] as string) ?? '',
      sentAt,
    };
  }

  private async persistConversation(
    match: Match,
    conversation: Conversation
  ): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) {
      return;
    }

    const userIds = [uid, match.user.id].sort();

    await runInInjectionContext(this.injector, () =>
      setDoc(
        doc(this.firestore, 'conversations', match.id),
        {
          id: match.id,
          matchId: match.id,
          userIds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );
  }

  private async persistMessage(
    matchId: string,
    message: ChatMessage
  ): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      await setDoc(doc(this.firestore, 'conversations', matchId, 'messages', message.id), {
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        sentAt: serverTimestamp(),
      });

      await updateDoc(doc(this.firestore, 'conversations', matchId), {
        updatedAt: serverTimestamp(),
        lastMessageText: message.text,
      });
    });
  }
}
