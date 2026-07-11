import { EnvironmentInjector, Injectable, OnDestroy, runInInjectionContext } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription, filter, firstValueFrom, take } from 'rxjs';
import animalSeeds from '../data/animal-seeds.json';
import { Animal } from '../interfaces/animal.interface';
import { User } from '../interfaces/user.interface';
import { AnimalLang, AnimalSeed, animalFromSeed } from '../utils/animal.utils';

@Injectable({ providedIn: 'root' })
export class AnimalService implements OnDestroy {
  private readonly animalsSubject = new BehaviorSubject<Animal[]>([]);
  private readonly readySubject = new BehaviorSubject(false);
  private unsubscribeFirestore?: () => void;
  private currentSeeds: AnimalSeed[] = [];
  private langSub?: Subscription;

  readonly animals$: Observable<Animal[]> = this.animalsSubject.asObservable();

  constructor(
    private readonly firestore: Firestore,
    private readonly injector: EnvironmentInjector,
    private readonly translate: TranslateService
  ) {
    this.startFirestoreListener();
    this.langSub = this.translate.onLangChange.subscribe(() => this.rebuildAnimals());
  }

  ngOnDestroy(): void {
    this.unsubscribeFirestore?.();
    this.langSub?.unsubscribe();
  }

  private get activeLang(): AnimalLang {
    return this.translate.getCurrentLang() === 'en' ? 'en' : 'fr';
  }

  private rebuildAnimals(): void {
    if (this.currentSeeds.length > 0) {
      this.publishAnimals(this.currentSeeds.map((seed) => animalFromSeed(seed, this.activeLang)));
    }
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
            this.currentSeeds = this.seedsFromSnapshot(snapshot.docs);
            this.rebuildAnimals();
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

  private seedsFromSnapshot(
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  ): AnimalSeed[] {
    return docs
      .map((docSnap) => ({ ...(docSnap.data() as unknown as AnimalSeed), id: docSnap.id }))
      .filter((seed) => seed.active !== false)
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }

  private useFallbackAnimals(): void {
    this.currentSeeds = (animalSeeds as AnimalSeed[]).filter((seed) => seed.active !== false);
    this.rebuildAnimals();
  }

  private publishAnimals(animals: Animal[]): void {
    this.animalsSubject.next(animals);
    this.readySubject.next(true);
  }
}
