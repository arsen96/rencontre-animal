import { Component, OnInit } from '@angular/core';
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
export class AnimalSelectPage implements OnInit {
  animals: Animal[] = [];
  selectedId?: string;
  flippedId?: string;

  constructor(
    private readonly mockData: MockDataService,
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.animals = this.mockData.getAnimals();
  }

  get canContinue(): boolean {
    return !!this.selectedId;
  }

  onCardClick(animal: Animal): void {
    if (this.flippedId === animal.id) {
      return;
    }
    this.flippedId = animal.id;
    this.selectedId = animal.id;
    this.session.patchOnboarding({ selectedAnimal: animal });
  }

  isFlipped(animal: Animal): boolean {
    return this.flippedId === animal.id;
  }

  isSelected(animal: Animal): boolean {
    return this.selectedId === animal.id;
  }

  continue(): void {
    if (this.canContinue) {
      this.router.navigate(['/profile-create']);
    }
  }
}
