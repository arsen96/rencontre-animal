import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../../../core/interfaces/user.interface';
import { AnimalService } from '../../../core/services/animal.service';

@Component({
  selector: 'app-profile-detail-modal',
  templateUrl: './profile-detail-modal.component.html',
  styleUrls: ['./profile-detail-modal.component.scss'],
  standalone: false,
})
export class ProfileDetailModalComponent implements OnInit, OnDestroy {
  @Input() profile!: User;

  private animalsSub?: Subscription;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly animalService: AnimalService
  ) {}

  ngOnInit(): void {
    this.refreshProfileAnimal();
    this.animalsSub = this.animalService.animals$.subscribe(() => {
      this.refreshProfileAnimal();
    });
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  private refreshProfileAnimal(): void {
    this.profile = this.animalService.enrichUser(this.profile);
  }
}
