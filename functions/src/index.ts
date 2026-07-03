import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import {
  FirestoreEvent,
  QueryDocumentSnapshot,
} from 'firebase-functions/v2/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2/options';

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

initializeApp();

export const notifyOnNewMessage = onDocumentCreated(
  'conversations/{conversationId}/messages/{messageId}',
  async (
    event: FirestoreEvent<QueryDocumentSnapshot | undefined, { conversationId: string; messageId: string }>
  ) => {
    const message = event.data?.data();
    if (!message) {
      return;
    }

    const senderId = message['senderId'] as string | undefined;
    const text = (message['text'] as string | undefined)?.trim();
    const conversationId = event.params.conversationId;

    if (!senderId || !text) {
      return;
    }

    const db = getFirestore();
    const conversationSnap = await db.doc(`conversations/${conversationId}`).get();
    const conversation = conversationSnap.data();

    if (!conversation) {
      return;
    }

    const userIds = conversation['userIds'] as string[] | undefined;
    const recipientId = userIds?.find((id) => id !== senderId);
    if (!recipientId) {
      return;
    }

    const recipientSnap = await db.doc(`users/${recipientId}`).get();
    const recipient = recipientSnap.data();
    const activeConversationId = recipient?.['activeConversationId'] as string | null | undefined;

    if (activeConversationId === `conv-${conversationId}`) {
      return;
    }

    const senderSnap = await db.doc(`users/${senderId}`).get();
    const senderName =
      (senderSnap.data()?.['displayName'] as string | undefined)?.trim() || 'Nouveau message';

    const tokensSnap = await db.collection(`users/${recipientId}/fcmTokens`).get();
    const tokens = tokensSnap.docs
      .map((docSnap: FirebaseFirestore.QueryDocumentSnapshot) => docSnap.data()['token'] as string | undefined)
      .filter((token: string | undefined): token is string => !!token);

    if (!tokens.length) {
      return;
    }

    const preview = text.length > 120 ? `${text.slice(0, 117)}...` : text;

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: senderName,
        body: preview,
      },
      data: {
        conversationId: `conv-${conversationId}`,
        matchId: conversationId,
      },
      android: {
        priority: 'high',
        notification: {
          icon: 'ic_notification',
          color: '#2d4a2d',
          sound: 'default',
        },
      },
    });

    const invalidTokens: string[] = [];
    response.responses.forEach((item: { success: boolean; error?: { code?: string } }, index: number) => {
      if (item.success) {
        return;
      }

      const code = item.error?.code;
      if (
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/registration-token-not-registered'
      ) {
        invalidTokens.push(tokens[index]);
      }
    });

    await Promise.all(
      invalidTokens.map((token) =>
        db
          .doc(`users/${recipientId}/fcmTokens/${sanitizeTokenDocId(token)}`)
          .delete()
          .catch(() => undefined)
      )
    );
  }
);

function sanitizeTokenDocId(token: string): string {
  return token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 120);
}
