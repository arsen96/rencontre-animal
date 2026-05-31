import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc,
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

  users$(): Observable<User[]> {
    return runInInjectionContext(
      this.injector,
      () =>
        collectionData(collection(this.firestore, this.collectionName), {
          idField: 'id',
        }) as Observable<User[]>
    );
  }
}
