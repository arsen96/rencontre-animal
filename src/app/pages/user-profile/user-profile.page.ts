import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../core/interfaces/user.interface';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: false,
})
export class UserProfilePage implements OnInit {
  user: User | null = null;

  constructor(
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.refreshUser();
  }

  ionViewWillEnter(): void {
    this.refreshUser();
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

  private refreshUser(): void {
    this.user = this.session.currentUser;
    if (!this.user) {
      this.router.navigate(['/landing']);
    }
  }
}
