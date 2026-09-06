import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Animal } from '../../core/interfaces/animal.interface';
import { AnimalService } from '../../core/services/animal.service';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.page.html',
  styleUrls: ['./collection-detail.page.scss'],
  standalone: false,
})
export class CollectionDetailPage implements OnInit, OnDestroy {
  animal?: Animal;
  flipped = false;
  private flipTimer?: number;
  private animalsSub?: Subscription;

  constructor(
    private readonly animalService: AnimalService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('animalId');
    if (!animalId) {
      void this.router.navigate(['/tabs/collection']);
      return;
    }

    this.animalsSub = this.animalService.animals$.subscribe((animals) => {
      this.animal = animals.find((a) => a.id === animalId);
      if (this.animal && !this.flipped) {
        this.flipTimer = window.setTimeout(() => (this.flipped = true), 260);
      }
    });
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
    if (this.flipTimer) {
      window.clearTimeout(this.flipTimer);
    }
  }

  goBack(): void {
    void this.router.navigate(['/tabs/collection']);
  }

  seeAffinities(): void {
    if (!this.animal) {
      return;
    }
    void this.router.navigate(['/tabs/explore'], {
      queryParams: { focus: this.animal.id },
    });
  }
}
