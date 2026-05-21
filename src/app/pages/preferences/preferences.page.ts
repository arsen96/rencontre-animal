import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MeetPreference } from '../../core/interfaces/user.interface';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
  standalone: false,
})
export class PreferencesPage {
  selected?: MeetPreference;

  readonly options: { value: MeetPreference; label: string }[] = [
    { value: 'femelle', label: 'Femelle' },
    { value: 'male', label: 'Mâle' },
    { value: 'tout', label: 'Tout le monde' },
  ];

  constructor(
    private readonly router: Router,
    private readonly session: UserSessionService
  ) {}

  select(value: MeetPreference): void {
    this.selected = value;
  }

  get canContinue(): boolean {
    return !!this.selected;
  }

  continue(): void {
    if (!this.selected) {
      return;
    }
    this.session.patchOnboarding({ meetPreference: this.selected });
    this.router.navigate(['/animal-select']);
  }
}
