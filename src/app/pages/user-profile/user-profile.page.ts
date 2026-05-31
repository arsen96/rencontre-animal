import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { User } from '../../core/interfaces/user.interface';
import { AuthService } from '../../core/services/auth.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: false,
})
export class UserProfilePage implements OnInit, OnDestroy {
  user: User | null = null;
  private sub?: Subscription;

  constructor(
    private readonly session: UserSessionService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.auth.authState$,
      this.session.currentUser$,
    ]).subscribe(([firebaseUser, user]) => {
      if (user) {
        this.user = user;
        return;
      }

      if (firebaseUser === null) {
        this.router.navigate(['/landing']);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  enterJungle(): void {
    this.router.navigate(['/jungle']);
  }

  editProfile(): void {
    this.router.navigate(['/profile-create'], { queryParams: { edit: 1 } });
  }

  changeAnimal(): void {
    this.router.navigate(['/animal-select'], { queryParams: { edit: 1 } });
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.session.reset();
    this.router.navigate(['/landing']);
  }
}
