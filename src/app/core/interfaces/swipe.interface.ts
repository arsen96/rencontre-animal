export type SwipeDirection = 'like' | 'pass';

export interface SwipeRecord {
  direction: SwipeDirection;
  createdAt: Date;
}

export interface FirestoreMatch {
  id: string;
  userIds: [string, string];
  matchedAt: Date;
}
