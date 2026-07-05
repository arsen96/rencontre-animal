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
  animals: Animal[] = [];
  searchTerm = '';
  selectedId?: string;
  isEdit = false;
  loading = true;

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
  }

  onCardClick(animal: Animal): void {
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

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
