import { ChatMessage } from './message.interface';
import { User } from './user.interface';

export interface Conversation {
  id: string;
  matchId: string;
  participant: User;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
  photosEnabled: boolean;
  photoRequestBy: string | null;
}
