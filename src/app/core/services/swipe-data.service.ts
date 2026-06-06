import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { Match } from '../interfaces/match.interface';
import { FirestoreMatch, SwipeDirection } from '../interfaces/swipe.interface';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class SwipeDataService {
  constructor(
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector
  ) {}

  buildMatchId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  async getSwipedUserIds(uid: string): Promise<Set<string>> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDocs(collection(this.firestore, 'users', uid, 'swipes'))
    );
    return new Set(snapshot.docs.map((d) => d.id));
  }

  async getPassedUserIds(uid: string): Promise<Set<string>> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDocs(collection(this.firestore, 'users', uid, 'swipes'))
    );
    return new Set(
      snapshot.docs
        .filter((d) => d.data()['direction'] === 'pass')
        .map((d) => d.id)
    );
  }

  async recordSwipe(
    uid: string,
    targetUid: string,
    direction: SwipeDirection
  ): Promise<void> {
    await runInInjectionContext(this.injector, () =>
      setDoc(doc(this.firestore, 'users', uid, 'swipes', targetUid), {
        direction,
        createdAt: serverTimestamp(),
      })
    );
  }

  async removeSwipe(uid: string, targetUid: string): Promise<void> {
    await runInInjectionContext(this.injector, () =>
      deleteDoc(doc(this.firestore, 'users', uid, 'swipes', targetUid))
    );
  }

  async hasLikeFrom(fromUid: string, toUid: string): Promise<boolean> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, 'users', fromUid, 'swipes', toUid))
    );
    if (!snapshot.exists()) {
      return false;
    }
    return snapshot.data()?.['direction'] === 'like';
  }

  async createMatch(currentUid: string, matchedUser: User): Promise<Match> {
    const matchId = this.buildMatchId(currentUid, matchedUser.id);
    const matchDoc: FirestoreMatch = {
      id: matchId,
      userIds: [currentUid, matchedUser.id].sort() as [string, string],
      matchedAt: new Date(),
    };

    await runInInjectionContext(this.injector, () =>
      setDoc(doc(this.firestore, 'matches', matchId), {
        ...matchDoc,
        matchedAt: serverTimestamp(),
      })
    );

    return {
      id: matchId,
      matchedAt: matchDoc.matchedAt,
      user: matchedUser,
      isNew: true,
    };
  }
}
