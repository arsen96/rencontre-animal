export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: Date;
}
