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

  readonly options: { value: MeetPreference; labelKey: string }[] = [
    { value: 'femelle', labelKey: 'preferences.femelle' },
    { value: 'male', labelKey: 'preferences.male' },
    { value: 'tout', labelKey: 'preferences.tout' },
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
    this.router.navigate(['/personality-quiz']);
  }
}
