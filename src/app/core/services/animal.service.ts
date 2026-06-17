import { EnvironmentInjector, Injectable, OnDestroy, runInInjectionContext } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, filter, firstValueFrom, take } from 'rxjs';
import animalSeeds from '../data/animal-seeds.json';
import { Animal } from '../interfaces/animal.interface';
import { User } from '../interfaces/user.interface';
import { AnimalSeed, animalFromSeed } from '../utils/animal.utils';

@Injectable({ providedIn: 'root' })
export class AnimalService implements OnDestroy {
  private readonly animalsSubject = new BehaviorSubject<Animal[]>([]);
  private readonly readySubject = new BehaviorSubject(false);
  private unsubscribeFirestore?: () => void;

  readonly animals$: Observable<Animal[]> = this.animalsSubject.asObservable();

  constructor(
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector
  ) {
    this.startFirestoreListener();
  }

  ngOnDestroy(): void {
    this.unsubscribeFirestore?.();
  }

  async getAnimals(): Promise<Animal[]> {
    if (this.readySubject.value) {
      return [...this.animalsSubject.value];
    }

    return firstValueFrom(
      this.animals$.pipe(
        filter((animals) => animals.length > 0),
        take(1)
      )
    );
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    const animals = await this.getAnimals();
    return animals.find((animal) => animal.id === id);
  }

  enrichAnimal(animal: Animal): Animal {
    const catalogAnimal = this.animalsSubject.value.find((item) => item.id === animal.id);
    if (!catalogAnimal) {
      return animal;
    }

    return { ...catalogAnimal, id: animal.id };
  }

  enrichUser(user: User): User {
    if (!user.animal) {
      return user;
    }

    return {
      ...user,
      animal: this.enrichAnimal(user.animal),
    };
  }

  private startFirestoreListener(): void {
    runInInjectionContext(this.injector, () => {
      this.unsubscribeFirestore = onSnapshot(
        collection(this.firestore, 'animals'),
        (snapshot) => {
          if (!snapshot.empty) {
            this.publishAnimals(this.mapSnapshot(snapshot.docs));
            return;
          }

          this.useFallbackAnimals();
        },
        (error) => {
          console.warn('Could not listen to animals from Firestore, using local fallback', error);
          this.useFallbackAnimals();
        }
      );
    });
  }

  private mapSnapshot(
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  ): Animal[] {
    return docs
      .map((docSnap) => {
        const seed = { ...(docSnap.data() as unknown as AnimalSeed), id: docSnap.id };
        return { seed, animal: animalFromSeed(seed) };
      })
      .filter(({ seed }) => seed.active !== false)
      .sort((left, right) => (left.seed.sortOrder ?? 0) - (right.seed.sortOrder ?? 0))
      .map(({ animal }) => animal);
  }

  private useFallbackAnimals(): void {
    const animals = (animalSeeds as AnimalSeed[])
      .filter((seed) => seed.active !== false)
      .map(animalFromSeed);
    this.publishAnimals(animals);
  }

  private publishAnimals(animals: Animal[]): void {
    this.animalsSubject.next(animals);
    this.readySubject.next(true);
  }
}
