import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-birthdate',
  templateUrl: './birthdate.page.html',
  styleUrls: ['./birthdate.page.scss'],
  standalone: false,
})
export class BirthdatePage {
  day?: number;
  month?: number;
  year?: number;

  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

  constructor(
    private readonly router: Router,
    private readonly session: UserSessionService
  ) {}

  get canContinue(): boolean {
    return !!(this.day && this.month && this.year);
  }

  continue(): void {
    if (!this.canContinue) {
      return;
    }
    this.session.patchOnboarding({
      birthDay: this.day,
      birthMonth: this.month,
      birthYear: this.year,
    });
    this.router.navigate(['/gender']);
  }
}
