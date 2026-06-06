import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Match } from '../interfaces/match.interface';
import { SwipeDirection } from '../interfaces/swipe.interface';
import { User } from '../interfaces/user.interface';
import { UserDataService } from './user-data.service';

@Injectable({ providedIn: 'root' })
export class SwipeDataService {
  constructor(
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector,
    private readonly userData: UserDataService
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
    await runInInjectionContext(this.injector, async () => {
      await setDoc(doc(this.firestore, 'users', uid, 'swipes', targetUid), {
        direction,
        createdAt: serverTimestamp(),
      });

      // Réponse à quelqu'un qui m'a liké : retirer son entrée de ma liste
      await this.removeIncomingLike(targetUid, uid);

      if (direction === 'like') {
        try {
          await this.addIncomingLike(uid, targetUid);
        } catch (error) {
          console.warn('Could not write incomingLike (check Firestore rules)', error);
        }
      }
    });
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
    const userIds = [currentUid, matchedUser.id].sort();
    const matchedAt = new Date();

    await runInInjectionContext(this.injector, async () => {
      await setDoc(
        doc(this.firestore, 'matches', matchId),
        {
          id: matchId,
          userIds,
          matchedAt: serverTimestamp(),
          [`seenBy.${currentUid}`]: true,
        },
        { merge: true }
      );

      await setDoc(
        doc(this.firestore, 'conversations', matchId),
        {
          id: matchId,
          matchId,
          userIds,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await this.removeIncomingLike(matchedUser.id, currentUid);
      await this.removeIncomingLike(currentUid, matchedUser.id);
    });

    return {
      id: matchId,
      matchedAt,
      user: matchedUser,
      isNew: true,
      conversationId: `conv-${matchId}`,
    };
  }

  async getMatches(currentUid: string): Promise<Match[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDocs(
        query(
          collection(this.firestore, 'matches'),
          where('userIds', 'array-contains', currentUid)
        )
      )
    );

    const matches: Match[] = [];

    for (const docSnap of snapshot.docs) {
      const match = await this.toMatch(docSnap.id, docSnap.data(), currentUid);
      if (match) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
  }

  async getUnseenMatches(currentUid: string): Promise<Match[]> {
    const all = await this.getMatches(currentUid);
    return all.filter((match) => match.isNew);
  }

  async getReceivedLikes(currentUid: string): Promise<User[]> {
    const swipedIds = await this.getSwipedUserIds(currentUid);

    let matchPartnerIds = new Set<string>();
    try {
      matchPartnerIds = await this.getMatchPartnerIds(currentUid);
    } catch (error) {
      console.warn('Could not load matches for received likes filter', error);
    }

    const fromUids = new Set<string>();

    try {
      const incomingSnapshot = await runInInjectionContext(this.injector, () =>
        getDocs(collection(this.firestore, 'users', currentUid, 'incomingLikes'))
      );
      for (const docSnap of incomingSnapshot.docs) {
        fromUids.add(docSnap.id);
      }
    } catch (error) {
      console.warn('Could not read incomingLikes (publish Firestore rules)', error);
    }

    try {
      const allUsers = await this.userData.getAllUsers();
      for (const candidate of allUsers) {
        if (
          candidate.id === currentUid ||
          swipedIds.has(candidate.id) ||
          matchPartnerIds.has(candidate.id) ||
          fromUids.has(candidate.id)
        ) {
          continue;
        }

        try {
          if (await this.hasLikeFrom(candidate.id, currentUid)) {
            fromUids.add(candidate.id);
          }
        } catch {
          // Lecture users/{candidate}/swipes/{currentUid} refusée si règles incomplètes
        }
      }
    } catch (error) {
      console.warn('Could not scan users for received likes', error);
    }

    const received: User[] = [];

    for (const fromUid of fromUids) {
      if (swipedIds.has(fromUid) || matchPartnerIds.has(fromUid)) {
        continue;
      }

      const user = await this.userData.getUser(fromUid);
      if (user) {
        received.push(user);
      }
    }

    return received.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async markMatchSeen(currentUid: string, matchId: string): Promise<void> {
    await runInInjectionContext(this.injector, () =>
      setDoc(
        doc(this.firestore, 'matches', matchId),
        { [`seenBy.${currentUid}`]: true },
        { merge: true }
      )
    );
  }

  private async addIncomingLike(fromUid: string, toUid: string): Promise<void> {
    await runInInjectionContext(this.injector, () =>
      setDoc(doc(this.firestore, 'users', toUid, 'incomingLikes', fromUid), {
        fromUid,
        createdAt: serverTimestamp(),
      })
    );
  }

  private async removeIncomingLike(fromUid: string, toUid: string): Promise<void> {
    try {
      await runInInjectionContext(this.injector, () =>
        deleteDoc(doc(this.firestore, 'users', toUid, 'incomingLikes', fromUid))
      );
    } catch {
      // Document may not exist.
    }
  }

  private async getMatchPartnerIds(currentUid: string): Promise<Set<string>> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDocs(
        query(
          collection(this.firestore, 'matches'),
          where('userIds', 'array-contains', currentUid)
        )
      )
    );

    const partnerIds = new Set<string>();
    for (const docSnap of snapshot.docs) {
      const otherUid = (docSnap.data()['userIds'] as string[]).find(
        (id) => id !== currentUid
      );
      if (otherUid) {
        partnerIds.add(otherUid);
      }
    }
    return partnerIds;
  }

  private async toMatch(
    matchId: string,
    data: Record<string, unknown>,
    currentUid: string
  ): Promise<Match | null> {
    const otherUid = (data['userIds'] as string[] | undefined)?.find(
      (id) => id !== currentUid
    );
    if (!otherUid) {
      return null;
    }

    const user = await this.userData.getUser(otherUid);
    if (!user) {
      return null;
    }

    const matchedAtRaw = data['matchedAt'];
    const matchedAt =
      matchedAtRaw &&
      typeof (matchedAtRaw as { toDate?: () => Date }).toDate === 'function'
        ? (matchedAtRaw as { toDate: () => Date }).toDate()
        : new Date();

    const seenBy = data['seenBy'] as Record<string, boolean> | undefined;
    const isNew = !seenBy?.[currentUid];

    return {
      id: matchId,
      matchedAt,
      user,
      isNew,
      conversationId: `conv-${matchId}`,
    };
  }
}
