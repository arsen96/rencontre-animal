import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Animal } from '../../core/interfaces/animal.interface';
import { AnimalService } from '../../core/services/animal.service';
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
  isEdit = false;
  private flipTimer?: number;
  private animalsSub?: Subscription;
  private animalId?: string;

  constructor(
    private readonly animalService: AnimalService,
    private readonly session: UserSessionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.queryParamMap.get('edit') === '1';

    const animalId = this.route.snapshot.paramMap.get('animalId');
    if (!animalId) {
      this.goBack();
      return;
    }

    this.animalId = animalId;
    this.animalsSub = this.animalService.animals$.subscribe((animals) => {
      const animal = animals.find((item) => item.id === animalId);
      if (!animal) {
        return;
      }

      this.animal = animal;

      if (!this.flipped) {
        this.flipTimer = window.setTimeout(() => {
          this.flipped = true;
        }, 260);
      }
    });
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
    if (this.flipTimer) {
      window.clearTimeout(this.flipTimer);
    }
  }

  get canContinue(): boolean {
    return !!this.animal;
  }

  continue(): void {
    if (!this.animal) {
      return;
    }

    if (this.isEdit) {
      this.session.updateAnimal(this.animal);
      void       this.router.navigate(['/tabs/my-card']);
      return;
    }

    this.session.patchOnboarding({ selectedAnimal: this.animal });
    void this.router.navigate(['/profile-create']);
  }

  goBack(): void {
    void this.router.navigate(['/animal-select'], {
      queryParamsHandling: 'preserve',
    });
  }
}
