import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  selectedId?: string;
  expandedAnimal?: Animal;
  overlayFlipped = false;
  private overlayFlipTimer?: number;

  constructor(
    private readonly mockData: MockDataService,
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.animals = this.mockData.getAnimals();
  }

  ngOnDestroy(): void {
    this.clearOverlayTimer();
  }

  get canContinue(): boolean {
    return !!this.selectedId;
  }

  onCardClick(animal: Animal): void {
    this.selectedId = animal.id;
    this.session.patchOnboarding({ selectedAnimal: animal });
    this.expandedAnimal = animal;
    this.overlayFlipped = false;
    this.clearOverlayTimer();
    this.overlayFlipTimer = window.setTimeout(() => {
      this.overlayFlipped = true;
    }, 70);
  }

  isSelected(animal: Animal): boolean {
    return this.selectedId === animal.id;
  }

  closeExpanded(event?: Event): void {
    event?.stopPropagation();
    this.overlayFlipped = false;
    this.expandedAnimal = undefined;
    this.clearOverlayTimer();
  }

  continue(): void {
    if (this.canContinue) {
      this.router.navigate(['/profile-create']);
    }
  }

  private clearOverlayTimer(): void {
    if (this.overlayFlipTimer) {
      window.clearTimeout(this.overlayFlipTimer);
      this.overlayFlipTimer = undefined;
    }
  }
}
