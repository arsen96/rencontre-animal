import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ViewWillEnter } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { CitySelection } from '../../core/interfaces/city-selection.interface';
import { GeoPoint, User } from '../../core/interfaces/user.interface';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { AnimalService } from '../../core/services/animal.service';
import { AppLanguage, LanguageService } from '../../core/services/language.service';
import { ChatService } from '../../core/services/chat.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { CityAutocompleteComponent } from '../../shared/components/city-autocomplete/city-autocomplete.component';
import { resolveCityCoordinates } from '../../core/utils/distance.util';
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
    private readonly chatService: ChatService,
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
        return;
      }

      if (firebaseUser === null) {
        this.router.navigate(['/landing']);
      }
    });
  }

  ionViewWillEnter(): void {
    void this.session.ensureCurrentUser().then((user) => {
      if (!user) {
        this.router.navigate(['/landing']);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get canEnterApp(): boolean {
    return this.cityValid;
  }

  enterApp(): void {
    if (!this.cityValid) {
      this.cityRequiredHint = true;
      this.cityAutocomplete?.markSelectionRequired();
      return;
    }

    this.cityRequiredHint = false;
    this.router.navigate(['/tabs/my-card']);
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

  editProfile(): void {
    this.router.navigate(['/profile-create'], { queryParams: { edit: 1 } });
  }

  changeAnimal(): void {
    this.router.navigate(['/personality-quiz'], { queryParams: { retake: 1 } });
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
}
