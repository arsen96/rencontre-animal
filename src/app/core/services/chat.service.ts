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
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
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
  private readonly conversationMetaListeners = new Map<string, Unsubscribe>();
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
    private readonly storage: Storage,
    private readonly injector: EnvironmentInjector
  ) {}

  setActiveConversation(conversationId: string | null): void {
    this.activeConversationId = conversationId;
    if (conversationId) {
      this.markAsRead(conversationId);
    }
    void this.syncActiveConversationPresence(conversationId);
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
          photosEnabled: !!data['photosEnabled'],
          photoRequestBy: (data['photoRequestBy'] as string | undefined) ?? null,
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

      const data = change.doc.data();
      const messages = await this.loadMessages(matchId, conversationId);
      this.applyMessages(conversationId, messages);
      this.applyConversationMeta(conversationId, {
        photosEnabled: !!data['photosEnabled'],
        photoRequestBy: (data['photoRequestBy'] as string | undefined) ?? null,
      });
    }
  }

  subscribeToMessages(matchId: string, conversationId: string): void {
    this.unsubscribeFromMessages(conversationId);
    this.subscribeToConversationMeta(matchId, conversationId);

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
    this.unsubscribeFromConversationMeta(conversationId);
  }

  private subscribeToConversationMeta(matchId: string, conversationId: string): void {
    this.unsubscribeFromConversationMeta(conversationId);

    const unsubscribe = runInInjectionContext(this.injector, () =>
      onSnapshot(
        doc(this.firestore, 'conversations', matchId),
        (snapshot) => {
          const data = snapshot.data();
          if (!data) {
            return;
          }

          this.applyConversationMeta(conversationId, {
            photosEnabled: !!data['photosEnabled'],
            photoRequestBy: (data['photoRequestBy'] as string | undefined) ?? null,
          });
        },
        (error) => {
          console.error('Failed to listen to conversation metadata', error);
        }
      )
    );

    this.conversationMetaListeners.set(conversationId, unsubscribe);
  }

  private unsubscribeFromConversationMeta(conversationId: string): void {
    const unsubscribe = this.conversationMetaListeners.get(conversationId);
    if (unsubscribe) {
      unsubscribe();
      this.conversationMetaListeners.delete(conversationId);
    }
  }

  private applyConversationMeta(
    conversationId: string,
    meta: { photosEnabled: boolean; photoRequestBy: string | null }
  ): void {
    const list = this.conversations.map((conversation) =>
      conversation.id === conversationId ? { ...conversation, ...meta } : conversation
    );
    this.conversationsSubject.next(list);
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
      photosEnabled: false,
      photoRequestBy: null,
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
      type: 'text',
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

  async sendImageMessage(conversationId: string, file: File): Promise<ChatMessage | null> {
    const uid = this.auth.uid;
    if (!uid || !file.type.startsWith('image/')) {
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image trop lourde (5 Mo max).');
    }

    const index = this.conversations.findIndex((c) => c.id === conversationId);
    if (index < 0) {
      return null;
    }

    const conversation = this.conversations[index];
    if (!conversation.photosEnabled) {
      return null;
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const storagePath = `conversations/${conversation.matchId}/photos/${messageId}`;

    let imageUrl: string;
    try {
      imageUrl = await runInInjectionContext(this.injector, async () => {
        const storageRef = ref(this.storage, storagePath);
        await uploadBytes(storageRef, file, { contentType: file.type });
        return getDownloadURL(storageRef);
      });
    } catch (error) {
      console.error('Failed to upload chat image', error);
      return null;
    }

    const message: ChatMessage = {
      id: messageId,
      conversationId,
      senderId: uid,
      type: 'image',
      text: 'Photo',
      imageUrl,
      sentAt: new Date(),
    };

    try {
      await this.persistMessage(conversation.matchId, message);
    } catch (error) {
      console.error('Failed to persist image message', error);
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

  bothUsersHaveMessaged(conversation: Conversation): boolean {
    const uid = this.auth.uid;
    const participantId = conversation.participant.id;
    if (!uid || !participantId) {
      return false;
    }

    const senders = new Set(conversation.messages.map((message) => message.senderId));
    return senders.has(uid) && senders.has(participantId);
  }

  canRequestPhotoSharing(conversation: Conversation): boolean {
    return (
      this.bothUsersHaveMessaged(conversation) &&
      !conversation.photosEnabled &&
      !conversation.photoRequestBy
    );
  }

  hasPendingPhotoRequestFromMe(conversation: Conversation): boolean {
    const uid = this.auth.uid;
    return !!uid && conversation.photoRequestBy === uid && !conversation.photosEnabled;
  }

  canRespondToPhotoRequest(conversation: Conversation): boolean {
    const uid = this.auth.uid;
    return (
      !!uid &&
      !!conversation.photoRequestBy &&
      conversation.photoRequestBy !== uid &&
      !conversation.photosEnabled
    );
  }

  async requestPhotoSharing(conversationId: string): Promise<boolean> {
    const uid = this.auth.uid;
    const conversation = this.getById(conversationId);
    if (!uid || !conversation || !this.canRequestPhotoSharing(conversation)) {
      return false;
    }

    try {
      await runInInjectionContext(this.injector, () =>
        updateDoc(doc(this.firestore, 'conversations', conversation.matchId), {
          photoRequestBy: uid,
        })
      );
      return true;
    } catch (error) {
      console.error('Failed to request photo sharing', error);
      return false;
    }
  }

  async respondToPhotoRequest(conversationId: string, accept: boolean): Promise<boolean> {
    const conversation = this.getById(conversationId);
    if (!conversation || !this.canRespondToPhotoRequest(conversation)) {
      return false;
    }

    try {
      await runInInjectionContext(this.injector, () =>
        updateDoc(doc(this.firestore, 'conversations', conversation.matchId), {
          photosEnabled: accept,
          photoRequestBy: null,
        })
      );
      return true;
    } catch (error) {
      console.error('Failed to respond to photo request', error);
      return false;
    }
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
    if (!last) {
      return 'Nouveau match — dis bonjour !';
    }
    if (last.type === 'image') {
      return 'Photo';
    }
    if (last.text) {
      return last.text;
    }
    return 'Nouveau match — dis bonjour !';
  }

  async clearPresence(uid: string): Promise<void> {
    try {
      await runInInjectionContext(this.injector, () =>
        updateDoc(doc(this.firestore, 'users', uid), {
          activeConversationId: null,
        })
      );
    } catch (error) {
      console.error('Failed to clear conversation presence', error);
    }
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
      type: (data['type'] as ChatMessage['type'] | undefined) ?? 'text',
      text: (data['text'] as string) ?? '',
      imageUrl: (data['imageUrl'] as string | undefined) ?? undefined,
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

  private async syncActiveConversationPresence(
    conversationId: string | null
  ): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) {
      return;
    }

    try {
      await runInInjectionContext(this.injector, () =>
        updateDoc(doc(this.firestore, 'users', uid), {
          activeConversationId: conversationId,
        })
      );
    } catch (error) {
      console.error('Failed to sync active conversation presence', error);
    }
  }

  private async persistMessage(
    matchId: string,
    message: ChatMessage
  ): Promise<void> {
    await runInInjectionContext(this.injector, async () => {
      await setDoc(doc(this.firestore, 'conversations', matchId, 'messages', message.id), {
        id: message.id,
        senderId: message.senderId,
        type: message.type,
        text: message.text,
        ...(message.imageUrl ? { imageUrl: message.imageUrl } : {}),
        sentAt: serverTimestamp(),
      });

      await updateDoc(doc(this.firestore, 'conversations', matchId), {
        updatedAt: serverTimestamp(),
        lastMessageText: message.type === 'image' ? 'Photo' : message.text,
      });
    });
  }
}
