import { User } from './user.interface';

export interface Match {
  id: string;
  matchedAt: Date;
  user: User;
  isNew: boolean;
  conversationId?: string;
}
