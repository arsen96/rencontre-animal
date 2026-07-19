import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  docData,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly collectionName = 'users';

  constructor(
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector
  ) {}

  saveUser(uid: string, user: User): Promise<void> {
    return runInInjectionContext(this.injector, () =>
      setDoc(
        doc(this.firestore, this.collectionName, uid),
        { ...user, id: uid },
        { merge: true }
      )
    );
  }

  async getUser(uid: string): Promise<User | null> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, this.collectionName, uid))
    );
    return snapshot.exists() ? (snapshot.data() as User) : null;
  }

  user$(uid: string): Observable<User> {
    return runInInjectionContext(
      this.injector,
      () => docData(doc(this.firestore, this.collectionName, uid)) as Observable<User>
    );
  }

  updateUser(uid: string, patch: Partial<User>): Promise<void> {
    return runInInjectionContext(this.injector, () =>
      updateDoc(doc(this.firestore, this.collectionName, uid), { ...patch })
    );
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDocs(collection(this.firestore, this.collectionName))
    );
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as User));
  }

  /**
   * Supprime le document utilisateur, ses sous-collections connues, ainsi que
   * les matchs/conversations le concernant (best-effort selon les règles Firestore).
   */
  async deleteUserData(uid: string): Promise<void> {
    for (const sub of ['swipes', 'incomingLikes', 'fcmTokens']) {
      await this.deleteSubcollection(uid, sub);
    }

    await this.deleteMatchesAndConversations(uid);

    await runInInjectionContext(this.injector, () =>
      deleteDoc(doc(this.firestore, this.collectionName, uid))
    );
  }

  private async deleteSubcollection(uid: string, sub: string): Promise<void> {
    try {
      const snapshot = await runInInjectionContext(this.injector, () =>
        getDocs(collection(this.firestore, this.collectionName, uid, sub))
      );
      await Promise.all(
        snapshot.docs.map((d) =>
          runInInjectionContext(this.injector, () => deleteDoc(d.ref))
        )
      );
    } catch (error) {
      console.warn(`Could not delete subcollection ${sub}`, error);
    }
  }

  private async deleteMatchesAndConversations(uid: string): Promise<void> {
    try {
      const matchesSnapshot = await runInInjectionContext(this.injector, () =>
        getDocs(
          query(
            collection(this.firestore, 'matches'),
            where('userIds', 'array-contains', uid)
          )
        )
      );
      await Promise.all(
        matchesSnapshot.docs.map((d) =>
          runInInjectionContext(this.injector, () => deleteDoc(d.ref))
        )
      );
    } catch (error) {
      console.warn('Could not delete matches for user', error);
    }

    try {
      const conversationsSnapshot = await runInInjectionContext(this.injector, () =>
        getDocs(
          query(
            collection(this.firestore, 'conversations'),
            where('userIds', 'array-contains', uid)
          )
        )
      );

      for (const conversationDoc of conversationsSnapshot.docs) {
        const messagesSnapshot = await runInInjectionContext(this.injector, () =>
          getDocs(collection(conversationDoc.ref, 'messages'))
        );
        await Promise.all(
          messagesSnapshot.docs.map((m) =>
            runInInjectionContext(this.injector, () => deleteDoc(m.ref))
          )
        );
        await runInInjectionContext(this.injector, () =>
          deleteDoc(conversationDoc.ref)
        );
      }
    } catch (error) {
      console.warn('Could not delete conversations for user', error);
    }
  }
}
