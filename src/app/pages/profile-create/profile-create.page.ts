import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../../core/interfaces/animal.interface';
import { CitySelection } from '../../core/interfaces/city-selection.interface';
import { GeoPoint } from '../../core/interfaces/user.interface';
import { UserSessionService } from '../../core/services/user-session.service';
import { resolveCityCoordinates } from '../../core/utils/distance.util';

@Component({
  selector: 'app-profile-create',
  templateUrl: './profile-create.page.html',
  styleUrls: ['./profile-create.page.scss'],
  standalone: false,
})
export class ProfileCreatePage implements OnInit {
  displayName = '';
  movie1 = '';
  movie2 = '';
  song1 = '';
  song2 = '';
  eyeColor = '';
  hairColor = '';
  height?: number;
  bio = '';
  city = '';
  cityLocation?: GeoPoint;
  cityValid = false;
  isEdit = false;
  animal?: Animal;

  readonly eyeColors = ['Verts', 'Bleus', 'Marrons', 'Noisette', 'Gris', 'Ambre'];
  readonly hairColors = ['Blonds', 'Bruns', 'Noirs', 'Roux', 'Châtains', 'Auburn'];

  constructor(
    private readonly session: UserSessionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('edit') !== '1') {
      return;
    }

    const user = this.session.currentUser;
    if (!user) {
      return;
    }

    this.isEdit = true;
    this.animal = user.animal;
    const noDash = (value: string): string => (value === '—' ? '' : value);
    this.displayName = user.displayName === 'Toi' ? '' : user.displayName;
    this.movie1 = noDash(user.profile.movies[0]);
    this.movie2 = noDash(user.profile.movies[1]);
    this.song1 = noDash(user.profile.songs[0]);
    this.song2 = noDash(user.profile.songs[1]);
    this.eyeColor = noDash(user.profile.eyeColor);
    this.hairColor = noDash(user.profile.hairColor);
    this.height = user.profile.height;
    this.bio = user.bio ?? '';
    this.city = user.city ?? '';
    this.cityLocation = user.location;
    if (this.city && !this.cityLocation) {
      this.cityLocation = resolveCityCoordinates(this.city) ?? undefined;
    }
    this.cityValid = !!(this.city.trim() && this.cityLocation);
  }

  get canContinue(): boolean {
    return !!(
      this.bio.trim() &&
      this.cityValid &&
      this.eyeColor &&
      this.hairColor &&
      this.height &&
      this.height > 100 &&
      this.height < 250
    );
  }

  onCitySelection(selection: CitySelection | null): void {
    if (selection) {
      this.city = selection.city;
      this.cityLocation = selection.location;
      this.cityValid = true;
      return;
    }

    this.cityValid = false;
    this.cityLocation = undefined;
  }

  changeAnimal(): void {
    const current = this.session.currentUser;
    this.session.updateProfile({
      displayName: this.displayName.trim(),
      bio: this.bio.trim(),
      city: this.city.trim(),
      location: this.cityLocation,
      profile: {
        movies: [this.movie1.trim() || '—', this.movie2.trim() || '—'],
        songs: [this.song1.trim() || '—', this.song2.trim() || '—'],
        eyeColor: this.eyeColor || current?.profile.eyeColor || '—',
        hairColor: this.hairColor || current?.profile.hairColor || '—',
        height: this.height ?? current?.profile.height ?? 0,
      },
    });
    this.router.navigate(['/personality-quiz'], { queryParams: { retake: 1 } });
  }

  submit(): void {
    if (!this.canContinue) {
      return;
    }

    if (this.isEdit) {
      this.session.updateProfile({
        displayName: this.displayName.trim(),
        bio: this.bio.trim(),
        city: this.city.trim(),
        location: this.cityLocation,
        profile: {
          movies: [this.movie1.trim() || '—', this.movie2.trim() || '—'],
          songs: [this.song1.trim() || '—', this.song2.trim() || '—'],
          eyeColor: this.eyeColor,
          hairColor: this.hairColor,
          height: this.height!,
        },
      });
      this.router.navigate(['/user-profile']);
      return;
    }

    this.session.patchOnboarding({
      bio: this.bio.trim(),
      city: this.city.trim(),
      location: this.cityLocation,
      profile: {
        movies: [this.movie1.trim(), this.movie2.trim()],
        songs: [this.song1.trim(), this.song2.trim()],
        eyeColor: this.eyeColor,
        hairColor: this.hairColor,
        height: this.height!,
      },
    });

    this.session.buildUserFromOnboarding(this.displayName.trim() || 'Toi');
    this.router.navigate(['/user-profile']);
  }
}
