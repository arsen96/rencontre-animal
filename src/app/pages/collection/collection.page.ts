import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Animal } from '../../core/interfaces/animal.interface';
import { AnimalService } from '../../core/services/animal.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
  standalone: false,
})
export class CollectionPage implements OnInit, OnDestroy {
  animals: Animal[] = [];
  searchTerm = '';
  loading = true;
  private animalsSub?: Subscription;

  constructor(
    private readonly animalService: AnimalService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.animalsSub = this.animalService.animals$.subscribe((animals) => {
      this.animals = animals;
      this.loading = animals.length === 0;
    });
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
  }

  get searchMetaLabel(): string {
    const count = this.filteredAnimals.length;
    const query = this.searchTerm.trim();
    if (query) {
      if (count === 0) {
        return '';
      }
      const key = count === 1 ? 'collection.metaFoundOne' : 'collection.metaFoundMany';
      return this.translate.instant(key, { count, query });
    }
    const key = count === 1 ? 'collection.metaAvailableOne' : 'collection.metaAvailableMany';
    return this.translate.instant(key, { count });
  }

  get filteredAnimals(): Animal[] {
    const query = this.normalizeText(this.searchTerm);
    if (!query) {
      return this.animals;
    }
    return this.animals.filter((animal) =>
      [animal.name, animal.personality, animal.description, ...animal.traits].some((value) =>
        this.normalizeText(value).includes(query)
      )
    );
  }

  onSearchInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value?: string | null }>;
    this.searchTerm = customEvent.detail?.value?.replace(/^\s+/, '') ?? '';
  }

  openAnimal(animal: Animal): void {
    void this.router.navigate([animal.id], { relativeTo: this.route });
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
