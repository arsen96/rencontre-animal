import { ChatMessage } from '../interfaces/message.interface';
import { User } from '../interfaces/user.interface';

/** Messages d'accueil simulés envoyés par le match (symétrique : les deux peuvent parler) */
export function buildWelcomeMessages(
  conversationId: string,
  participant: User
): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: `${conversationId}-welcome-1`,
      conversationId,
      senderId: participant.id,
      type: 'text',
      text: `Salut ! ${participant.animal.emoji} Content·e de matcher dans la jungle.`,
      sentAt: new Date(now - 120_000),
    },
    {
      id: `${conversationId}-welcome-2`,
      conversationId,
      senderId: participant.id,
      type: 'text',
      text: 'Tu veux discuter ? Envoie-moi un message quand tu veux 🌿',
      sentAt: new Date(now - 60_000),
    },
  ];
}
