import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Animal } from '../../core/interfaces/animal.interface';
import { AnimalService } from '../../core/services/animal.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-animal-select',
  templateUrl: './animal-select.page.html',
  styleUrls: ['./animal-select.page.scss'],
  standalone: false,
})
export class AnimalSelectPage implements OnInit, OnDestroy {
  readonly pageSize = 40;

  animals: Animal[] = [];
  searchTerm = '';
  selectedId?: string;
  isEdit = false;
  loading = true;
  currentPage = 1;

  private animalsSub?: Subscription;

  constructor(
    private readonly animalService: AnimalService,
    private readonly session: UserSessionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.queryParamMap.get('edit') === '1';

    this.animalsSub = this.animalService.animals$.subscribe((animals) => {
      this.animals = animals;
      this.loading = animals.length === 0;
      this.syncPagination();
    });

    if (this.isEdit && this.session.currentUser) {
      this.selectedId = this.session.currentUser.animal.id;
      return;
    }

    const onboardingAnimal = this.session.onboarding?.selectedAnimal;
    if (onboardingAnimal) {
      this.selectedId = onboardingAnimal.id;
    }
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
  }

  get canContinue(): boolean {
    return !!this.selectedId;
  }

  get searchMetaLabel(): string {
    const count = this.filteredAnimals.length;
    const query = this.searchTerm.trim();

    if (query) {
      if (count === 0) {
        return '';
      }

      if (count === 1) {
        return `1 animal trouvé pour « ${query} »`;
      }

      return `${count} animaux trouvés pour « ${query} »`;
    }

    if (count === 1) {
      return '1 animal disponible';
    }

    return `${count} animaux disponibles`;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAnimals.length / this.pageSize));
  }

  get paginatedAnimals(): Animal[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAnimals.slice(start, start + this.pageSize);
  }

  get pageLabel(): string {
    return `Page ${this.currentPage} sur ${this.totalPages}`;
  }

  get showPagination(): boolean {
    return this.filteredAnimals.length > this.pageSize;
  }

  get canGoToPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get canGoToNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get filteredAnimals(): Animal[] {
    const query = this.normalizeText(this.searchTerm);
    if (!query) {
      return this.animals;
    }

    return this.animals.filter((animal) =>
      [
        animal.name,
        animal.personality,
        animal.description,
        ...animal.traits,
      ].some((value) => this.normalizeText(value).includes(query))
    );
  }

  onSearchInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value?: string | null }>;
    this.searchTerm = customEvent.detail?.value?.replace(/^\s+/, '') ?? '';
    this.currentPage = 1;
  }

  onCardClick(animal: Animal): void {
    this.selectedId = animal.id;
    this.session.patchOnboarding({ selectedAnimal: animal });
    void this.router.navigate([animal.id], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  isSelected(animal: Animal): boolean {
    return this.selectedId === animal.id;
  }

  continue(): void {
    if (!this.canContinue) {
      return;
    }

    if (this.isEdit) {
      const animal = this.animals.find((a) => a.id === this.selectedId);
      if (animal) {
        this.session.updateAnimal(animal);
      }
      this.router.navigate(['/jungle']);
      return;
    }

    this.router.navigate(['/profile-create']);
  }

  goBack(): void {
    if (this.isEdit) {
      void this.router.navigate(['/user-profile']);
      return;
    }

    void this.router.navigate(['/animal-select'], {
      queryParamsHandling: 'preserve',
    });
  }

  previousPage(): void {
    if (!this.canGoToPreviousPage) {
      return;
    }

    this.currentPage -= 1;
  }

  nextPage(): void {
    if (!this.canGoToNextPage) {
      return;
    }

    this.currentPage += 1;
  }

  private syncPagination(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
