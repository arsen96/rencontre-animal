export type ChatMessageType = 'text' | 'image';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: ChatMessageType;
  text: string;
  imageUrl?: string;
  sentAt: Date;
}
