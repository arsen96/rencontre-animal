import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../../core/interfaces/animal.interface';
import { MockDataService } from '../../core/services/mock-data.service';
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
  expandedAnimal?: Animal;
  overlayFlipped = false;
  overlayEntering = false;
  overlayClosing = false;
  private overlayFlipTimer?: number;
  private overlayEnterTimer?: number;
  private overlayCloseTimer?: number;

  constructor(
    private readonly mockData: MockDataService,
    private readonly session: UserSessionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.animals = this.mockData.getAnimals();
    this.isEdit = this.route.snapshot.queryParamMap.get('edit') === '1';
    if (this.isEdit && this.session.currentUser) {
      this.selectedId = this.session.currentUser.animal.id;
    }
  }

  ngOnDestroy(): void {
    this.clearOverlayTimers();
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
    if (this.expandedAnimal && !this.overlayClosing) {
      return;
    }

    this.selectedId = animal.id;
    this.session.patchOnboarding({ selectedAnimal: animal });
    this.expandedAnimal = animal;
    this.overlayFlipped = false;
    this.overlayClosing = false;
    this.overlayEntering = true;
    this.clearOverlayTimers();
    this.overlayFlipTimer = window.setTimeout(() => {
      this.overlayFlipped = true;
    }, 260);
    this.overlayEnterTimer = window.setTimeout(() => {
      this.overlayEntering = false;
    }, 760);
  }

  isSelected(animal: Animal): boolean {
    return this.selectedId === animal.id;
  }

  closeExpanded(event?: Event): void {
    event?.stopPropagation();
    if (!this.expandedAnimal || this.overlayClosing) {
      return;
    }

    this.clearOverlayTimers();
    this.overlayEntering = false;
    this.overlayClosing = true;
    this.overlayFlipped = false;
    this.overlayCloseTimer = window.setTimeout(() => {
      this.expandedAnimal = undefined;
      this.overlayClosing = false;
    }, 760);
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

  private clearOverlayTimers(): void {
    if (this.overlayFlipTimer) {
      window.clearTimeout(this.overlayFlipTimer);
      this.overlayFlipTimer = undefined;
    }

    if (this.overlayEnterTimer) {
      window.clearTimeout(this.overlayEnterTimer);
      this.overlayEnterTimer = undefined;
    }

    if (this.overlayCloseTimer) {
      window.clearTimeout(this.overlayCloseTimer);
      this.overlayCloseTimer = undefined;
    }
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
