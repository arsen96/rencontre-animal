import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Gender } from '../../core/interfaces/user.interface';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-gender',
  templateUrl: './gender.page.html',
  styleUrls: ['./gender.page.scss'],
  standalone: false,
})
export class GenderPage {
  selected?: Gender;

  readonly options: { value: Gender; labelKey: string }[] = [
    { value: 'femelle', labelKey: 'gender.femelle' },
    { value: 'male', labelKey: 'gender.male' },
    { value: 'non-binaire', labelKey: 'gender.nonBinaire' },
  ];

  constructor(
    private readonly router: Router,
    private readonly session: UserSessionService
  ) {}

  select(value: Gender): void {
    this.selected = value;
  }

  get canContinue(): boolean {
    return !!this.selected;
  }

  continue(): void {
    if (!this.selected) {
      return;
    }
    this.session.patchOnboarding({ gender: this.selected });
    this.router.navigate(['/profile-create']);
  }
}
