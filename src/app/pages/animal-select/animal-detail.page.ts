import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../../core/interfaces/animal.interface';
import { MockDataService } from '../../core/services/mock-data.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-animal-detail',
  templateUrl: './animal-detail.page.html',
  styleUrls: ['./animal-detail.page.scss'],
  standalone: false,
})
export class AnimalDetailPage implements OnInit, OnDestroy {
  animal?: Animal;
  flipped = false;
  private flipTimer?: number;

  constructor(
    private readonly mockData: MockDataService,
    private readonly session: UserSessionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('animalId');
    if (!animalId) {
      this.goBack();
      return;
    }

    const animal = this.mockData.getAnimals().find((item) => item.id === animalId);
    if (!animal) {
      this.goBack();
      return;
    }

    this.animal = animal;
    this.session.patchOnboarding({ selectedAnimal: animal });
    this.flipTimer = window.setTimeout(() => {
      this.flipped = true;
    }, 260);
  }

  ngOnDestroy(): void {
    if (this.flipTimer) {
      window.clearTimeout(this.flipTimer);
    }
  }

  goBack(): void {
    void this.router.navigate(['/animal-select'], {
      queryParamsHandling: 'preserve',
    });
  }
}
