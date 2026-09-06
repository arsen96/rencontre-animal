import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../../core/interfaces/animal.interface';
import { UserDataService } from '../../core/services/user-data.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-totem-reveal',
  templateUrl: './totem-reveal.page.html',
  styleUrls: ['./totem-reveal.page.scss'],
  standalone: false,
})
export class TotemRevealPage implements OnInit {
  animal?: Animal;
  flipped = false;
  isRetake = false;
  private flipTimer?: number;

  constructor(
    private readonly session: UserSessionService,
    private readonly auth: AuthService,
    private readonly userData: UserDataService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isRetake = this.route.snapshot.queryParamMap.get('retake') === '1';
    this.animal =
      this.session.onboarding.selectedAnimal ?? this.session.currentUser?.animal;

    if (!this.animal) {
      void this.router.navigate(['/personality-quiz']);
      return;
    }

    this.flipTimer = window.setTimeout(() => {
      this.flipped = true;
    }, 320);
  }

  ionViewWillLeave(): void {
    if (this.flipTimer) {
      window.clearTimeout(this.flipTimer);
    }
  }

  continue(): void {
    if (!this.animal) {
      return;
    }

    if (this.isRetake) {
      const current = this.session.currentUser;
      if (current) {
        const updated = {
          ...current,
          animal: this.animal,
          quizAnswers: this.session.onboarding.quizAnswers,
          quizScores: this.session.onboarding.quizScores,
          totemAssignedAt: new Date().toISOString(),
        };
        this.session.setCurrentUser(updated);
        const uid = this.auth.uid;
        if (uid) {
          void this.userData.saveUser(uid, updated);
        }
      }
      void this.router.navigate(['/tabs/my-card']);
      return;
    }

    this.session.patchOnboarding({ selectedAnimal: this.animal });
    void this.router.navigate(['/birthdate']);
  }
}
