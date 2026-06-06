import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { combineLatest, Subscription } from 'rxjs';
import { Match } from '../../core/interfaces/match.interface';
import { User } from '../../core/interfaces/user.interface';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { SwipeDataService } from '../../core/services/swipe-data.service';
import { SwipeService } from '../../core/services/swipe.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { ProfileDetailModalComponent } from '../../shared/components/profile-detail-modal/profile-detail-modal.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: false,
})
export class UserProfilePage implements OnInit, OnDestroy, ViewWillEnter {
  user: User | null = null;
  city = '';
  cityRequiredHint = false;
  ageRange: { lower: number; upper: number } = { lower: 18, upper: 45 };
  matches: Match[] = [];
  receivedLikes: User[] = [];
  loadingConnections = true;
  respondingTo: string | null = null;

  private sub?: Subscription;

  constructor(
    private readonly session: UserSessionService,
    private readonly auth: AuthService,
    private readonly swipeData: SwipeDataService,
    private readonly swipeService: SwipeService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.auth.authState$,
      this.session.currentUser$,
    ]).subscribe(([firebaseUser, user]) => {
      if (user) {
        this.user = user;
        this.city = user.city ?? '';
        if (user.ageRange) {
          this.ageRange = { lower: user.ageRange.min, upper: user.ageRange.max };
        }
        return;
      }

      if (firebaseUser === null) {
        this.router.navigate(['/landing']);
      }
    });
  }

  ionViewWillEnter(): void {
    void this.loadConnections();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get canEnterJungle(): boolean {
    return this.city.trim().length > 0;
  }

  enterJungle(): void {
    const trimmedCity = this.city.trim();
    if (!trimmedCity) {
      this.cityRequiredHint = true;
      return;
    }

    this.cityRequiredHint = false;
    this.session.updateProfile({ city: trimmedCity });
    this.router.navigate(['/jungle']);
  }

  onCityChange(value: string): void {
    this.city = value;
    if (this.city.trim()) {
      this.cityRequiredHint = false;
    }
  }

  saveCity(): void {
    const trimmedCity = this.city.trim();
    if (!trimmedCity) {
      this.cityRequiredHint = true;
      return;
    }

    this.cityRequiredHint = false;
    this.session.updateProfile({ city: trimmedCity });
  }

  onAgeRangeChange(event: CustomEvent): void {
    const value = event.detail?.value as { lower: number; upper: number } | undefined;
    if (!value || !this.user) {
      return;
    }
    this.ageRange = value;
    this.session.updateProfile({
      ageRange: { min: value.lower, max: value.upper },
    });
  }

  editProfile(): void {
    this.router.navigate(['/profile-create'], { queryParams: { edit: 1 } });
  }

  changeAnimal(): void {
    this.router.navigate(['/animal-select'], { queryParams: { edit: 1 } });
  }

  openMatchChat(match: Match): void {
    const conversation = this.chatService.ensureConversation(match);
    this.router.navigate(['/chat', conversation.id]);
  }

  async openProfileDetail(profile: User): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ProfileDetailModalComponent,
      componentProps: { profile },
      cssClass: 'profile-detail-modal',
    });
    await modal.present();
  }

  async acceptLike(profile: User): Promise<void> {
    if (!this.user || this.respondingTo) {
      return;
    }

    this.respondingTo = profile.id;
    try {
      const match = await this.swipeService.respondToReceivedLike(
        this.user,
        profile,
        'like'
      );
      await this.loadConnections();

      if (match) {
        await this.swipeData.markMatchSeen(this.user.id, match.id);
      }
    } finally {
      this.respondingTo = null;
    }
  }

  async declineLike(profile: User): Promise<void> {
    if (!this.user || this.respondingTo) {
      return;
    }

    this.respondingTo = profile.id;
    try {
      await this.swipeService.respondToReceivedLike(this.user, profile, 'pass');
      await this.loadConnections();
    } finally {
      this.respondingTo = null;
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.session.reset();
    this.chatService.clear();
    this.router.navigate(['/landing']);
  }

  private async loadConnections(): Promise<void> {
    const user = await this.session.ensureCurrentUser();
    if (!user) {
      this.router.navigate(['/landing']);
      return;
    }

    this.loadingConnections = true;
    try {
      await this.chatService.syncFromFirestore(user.id);

      try {
        this.matches = await this.swipeData.getMatches(user.id);
      } catch (error) {
        console.error('Failed to load matches', error);
        this.matches = [];
      }

      try {
        this.receivedLikes = await this.swipeData.getReceivedLikes(user.id);
      } catch (error) {
        console.error('Failed to load received likes', error);
        this.receivedLikes = [];
      }
    } catch (error) {
      console.error('Failed to load profile connections', error);
    } finally {
      this.loadingConnections = false;
    }
  }
}
