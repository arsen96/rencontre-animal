import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ViewWillEnter } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { Match } from '../../core/interfaces/match.interface';
import { CitySelection } from '../../core/interfaces/city-selection.interface';
import { GeoPoint, User } from '../../core/interfaces/user.interface';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { AnimalService } from '../../core/services/animal.service';
import { AppLanguage, LanguageService } from '../../core/services/language.service';
import { ChatService } from '../../core/services/chat.service';
import { SwipeDataService } from '../../core/services/swipe-data.service';
import { SwipeService } from '../../core/services/swipe.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { ProfileDetailModalComponent } from '../../shared/components/profile-detail-modal/profile-detail-modal.component';
import { CityAutocompleteComponent } from '../../shared/components/city-autocomplete/city-autocomplete.component';
import { withDistanceFrom, resolveCityCoordinates } from '../../core/utils/distance.util';
import { openExternalUrl } from '../../core/utils/open-external-url.util';
import { buildSafetyReportMailto } from '../../core/utils/safety-report.util';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: false,
})
export class UserProfilePage implements OnInit, OnDestroy, ViewWillEnter {
  user: User | null = null;
  city = '';
  cityLocation?: GeoPoint;
  cityValid = false;
  cityRequiredHint = false;
  ageRange: { lower: number; upper: number } = { lower: 18, upper: 45 };
  matches: Match[] = [];
  receivedLikes: User[] = [];
  loadingConnections = true;
  respondingTo: string | null = null;
  languages: readonly AppLanguage[] = ['fr', 'en'];
  currentLanguage: AppLanguage = 'fr';
  accountBusy = false;
  readonly languageFlags: Record<AppLanguage, string> = {
    fr: 'assets/flags/fr.svg',
    en: 'assets/flags/gb.svg',
  };

  @ViewChild(CityAutocompleteComponent) cityAutocomplete?: CityAutocompleteComponent;

  private sub?: Subscription;

  constructor(
    private readonly session: UserSessionService,
    private readonly animalService: AnimalService,
    private readonly auth: AuthService,
    private readonly accountService: AccountService,
    private readonly swipeData: SwipeDataService,
    private readonly swipeService: SwipeService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController,
    private readonly router: Router,
    private readonly languageService: LanguageService,
    private readonly translate: TranslateService
  ) {}

  onLanguageChange(event: CustomEvent): void {
    const value = event.detail?.value as AppLanguage | undefined;
    if (!value || value === this.currentLanguage) {
      return;
    }
    this.currentLanguage = value;
    this.languageService.setLanguage(value);
  }

  ngOnInit(): void {
    this.languages = this.languageService.supportedLanguages;
    this.currentLanguage = this.languageService.getCurrentLanguage();

    this.sub = combineLatest([
      this.auth.authState$,
      this.session.currentUser$,
      this.animalService.animals$,
    ]).subscribe(([firebaseUser, user]) => {
      if (user) {
        this.user = this.animalService.enrichUser(user);
        this.applyUserCity(this.user);
        if (this.user.ageRange) {
          this.ageRange = { lower: this.user.ageRange.min, upper: this.user.ageRange.max };
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
    return this.cityValid;
  }

  enterJungle(): void {
    if (!this.cityValid) {
      this.cityRequiredHint = true;
      this.cityAutocomplete?.markSelectionRequired();
      return;
    }

    this.cityRequiredHint = false;
    this.router.navigate(['/jungle']);
  }

  onCitySelection(selection: CitySelection | null): void {
    if (selection) {
      this.city = selection.city;
      this.cityLocation = selection.location;
      this.cityValid = true;
      this.cityRequiredHint = false;
      this.session.updateProfile({
        city: selection.city,
        location: selection.location,
      });
      return;
    }

    this.cityValid = false;
    this.cityLocation = undefined;
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
    const enriched = this.user ? withDistanceFrom(this.user, profile) : profile;
    const modal = await this.modalCtrl.create({
      component: ProfileDetailModalComponent,
      componentProps: { profile: enriched },
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

  get isPaused(): boolean {
    return !!this.user?.paused;
  }

  async confirmTogglePause(): Promise<void> {
    if (this.accountBusy) {
      return;
    }

    const pausing = !this.isPaused;
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        pausing ? 'account.pauseConfirmTitle' : 'account.resumeConfirmTitle'
      ),
      message: this.translate.instant(
        pausing ? 'account.pauseConfirmMessage' : 'account.resumeConfirmMessage'
      ),
      buttons: [
        {
          text: this.translate.instant('account.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant(
            pausing ? 'account.pauseConfirm' : 'account.resumeConfirm'
          ),
          role: 'confirm',
          handler: () => {
            void this.applyPause(pausing);
          },
        },
      ],
    });

    await alert.present();
  }

  private async applyPause(paused: boolean): Promise<void> {
    this.accountBusy = true;
    try {
      await this.accountService.setPaused(paused);
      if (this.user) {
        this.user = { ...this.user, paused };
      }
    } catch (error) {
      console.error('Failed to update pause state', error);
      await this.showErrorAlert();
    } finally {
      this.accountBusy = false;
    }
  }

  async confirmDeleteAccount(): Promise<void> {
    if (this.accountBusy) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: this.translate.instant('account.deleteConfirmTitle'),
      message: this.translate.instant('account.deleteConfirmMessage'),
      buttons: [
        {
          text: this.translate.instant('account.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('account.deleteConfirm'),
          role: 'destructive',
          cssClass: 'alert-button-danger',
          handler: () => {
            void this.performDeleteAccount();
          },
        },
      ],
    });

    await alert.present();
  }

  private async performDeleteAccount(): Promise<void> {
    this.accountBusy = true;
    try {
      await this.accountService.deleteAccount();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Failed to delete account', error);
      await this.showErrorAlert();
    } finally {
      this.accountBusy = false;
    }
  }

  private async showErrorAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('account.errorTitle'),
      message: this.translate.instant('account.errorMessage'),
      buttons: [this.translate.instant('account.ok')],
    });
    await alert.present();
  }

  openPrivacyPolicy(): void {
    openExternalUrl(this.languageService.getPrivacyPolicyUrl());
  }

  openChildSafetyStandards(): void {
    openExternalUrl(this.languageService.getChildSafetyUrl());
  }

  reportSafetyIssue(): void {
    const subject = this.translate.instant('safety.reportSubject');
    const body = this.translate.instant('safety.reportBody');
    openExternalUrl(buildSafetyReportMailto(subject, body));
  }

  private applyUserCity(user: User): void {
    this.city = user.city ?? '';
    this.cityLocation = user.location;

    if (this.city && !this.cityLocation) {
      this.cityLocation = resolveCityCoordinates(this.city) ?? undefined;
      if (this.cityLocation) {
        this.session.updateProfile({
          city: this.city,
          location: this.cityLocation,
        });
      }
    }

    this.cityValid = !!(this.city.trim() && this.cityLocation);
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
        const matches = await this.swipeData.getMatches(user.id);
        this.matches = matches.map((match) => ({
          ...match,
          user: this.animalService.enrichUser(withDistanceFrom(user, match.user)),
        }));
      } catch (error) {
        console.error('Failed to load matches', error);
        this.matches = [];
      }

      try {
        const receivedLikes = await this.swipeData.getReceivedLikes(user.id);
        this.receivedLikes = receivedLikes.map((profile) =>
          this.animalService.enrichUser(withDistanceFrom(user, profile))
        );
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
