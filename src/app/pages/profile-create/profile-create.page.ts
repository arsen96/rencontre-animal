import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-profile-create',
  templateUrl: './profile-create.page.html',
  styleUrls: ['./profile-create.page.scss'],
  standalone: false,
})
export class ProfileCreatePage {
  movie1 = '';
  movie2 = '';
  song1 = '';
  song2 = '';
  eyeColor = '';
  hairColor = '';
  height?: number;

  readonly eyeColors = ['Verts', 'Bleus', 'Marrons', 'Noisette', 'Gris', 'Ambre'];
  readonly hairColors = ['Blonds', 'Bruns', 'Noirs', 'Roux', 'Châtains', 'Auburn'];

  constructor(
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  get canContinue(): boolean {
    return !!(
      this.movie1.trim() &&
      this.movie2.trim() &&
      this.song1.trim() &&
      this.song2.trim() &&
      this.eyeColor &&
      this.hairColor &&
      this.height &&
      this.height > 100 &&
      this.height < 250
    );
  }

  submit(): void {
    if (!this.canContinue) {
      return;
    }

    this.session.patchOnboarding({
      profile: {
        movies: [this.movie1.trim(), this.movie2.trim()],
        songs: [this.song1.trim(), this.song2.trim()],
        eyeColor: this.eyeColor,
        hairColor: this.hairColor,
        height: this.height!,
      },
    });

    this.session.buildUserFromOnboarding('Toi');
    this.router.navigate(['/user-profile']);
  }
}
