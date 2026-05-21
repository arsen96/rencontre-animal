import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-profile-detail-modal',
  templateUrl: './profile-detail-modal.component.html',
  styleUrls: ['./profile-detail-modal.component.scss'],
  standalone: false,
})
export class ProfileDetailModalComponent {
  @Input() profile!: User;

  constructor(private readonly modalCtrl: ModalController) {}

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
