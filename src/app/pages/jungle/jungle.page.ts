import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../../core/interfaces/user.interface';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { SwipeDataService } from '../../core/services/swipe-data.service';
import { SwipeService } from '../../core/services/swipe.service';
import { UserSessionService } from '../../core/services/user-session.service';
import {
  ProfileDetailModalComponent,
} from '../../shared/components/profile-detail-modal/profile-detail-modal.component';
import {
  SwipeCardComponent,
  SwipeDirection,
} from '../../shared/components/swipe-card/swipe-card.component';

@Component({
  selector: 'app-jungle',
  templateUrl: './jungle.page.html',
  styleUrls: ['./jungle.page.scss'],
  standalone: false,
})
export class JunglePage implements OnInit, OnDestroy, ViewWillEnter {
  deck: User[] = [];
  unreadChats = 0;
  loadingDeck = true;
  passedProfilesCount = 0;
  discoveryHint: string | null = null;
  @ViewChildren(SwipeCardComponent) cardComponents!: QueryList<SwipeCardComponent>;

  private unreadSub?: Subscription;
  private passedSub?: Subscription;

  constructor(
    private readonly swipeService: SwipeService,
    private readonly swipeData: SwipeDataService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController,
    private readonly auth: AuthService,
    private readonly session: UserSessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.swipeService.deck$.subscribe((deck) => {
      this.deck = deck;
      this.discoveryHint = this.swipeService.discoveryTierLabel;
    });
    this.unreadSub = this.chatService.totalUnread$.subscribe((n) => {
      this.unreadChats = n;
    });
    this.passedSub = this.swipeService.passedProfiles$.subscribe((list) => {
      this.passedProfilesCount = list.length;
    });
  }

  private loadDeckInProgress = false;
  private lastDeckKey: string | null = null;

  ionViewWillEnter(): void {
    void this.loadDeck();
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
    this.passedSub?.unsubscribe();
  }

  private async loadDeck(): Promise<void> {
    if (this.loadDeckInProgress) {
      return;
    }

    this.loadDeckInProgress = true;
    try {
      const user = await this.session.ensureCurrentUser();
      if (!user) {
        await this.auth.logout();
        this.session.reset();
        this.lastDeckKey = null;
        this.router.navigate(['/landing']);
        return;
      }

      const deckKey = this.buildDeckKey(user);
      const shouldReload =
        this.lastDeckKey !== deckKey ||
        (this.deck.length === 0 && !this.swipeService.hasPassedProfiles);

      if (shouldReload) {
        this.loadingDeck = true;
        await this.swipeService.initDeck(user, this.lastDeckKey !== deckKey);
        this.lastDeckKey = deckKey;
      }

      await this.chatService.syncFromFirestore(user.id);
    } finally {
      this.loadingDeck = false;
      this.loadDeckInProgress = false;
    }
  }

  private buildDeckKey(user: User): string {
    const range = user.ageRange ?? { min: 18, max: 45 };
    return `${user.id}:${range.min}-${range.max}`;
  }

  openChats(): void {
    this.router.navigate(['/chats']);
  }

  openProfile(): void {
    this.router.navigate(['/user-profile']);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.session.reset();
    this.chatService.clear();
    this.router.navigate(['/landing']);
  }

  get visibleCards(): User[] {
    return this.deck.slice(0, 3);
  }

  get isEmpty(): boolean {
    return !this.loadingDeck && this.deck.length === 0;
  }

  get hasPassedProfiles(): boolean {
    return this.passedProfilesCount > 0;
  }

  get passedCount(): number {
    return this.passedProfilesCount;
  }

  restartWithPassed(): void {
    void this.swipeService.restartWithPassed();
  }

  onSwiped(direction: SwipeDirection): void {
    if (direction === 'right') {
      void this.swipeService.swipeRight().then(async (match) => {
        if (match) {
          const uid = (await this.session.ensureCurrentUser())?.id;
          if (uid) {
            await this.swipeData.markMatchSeen(uid, match.id);
          }
          this.router.navigate(['/match'], {
            state: { match },
          });
        }
      });
    } else {
      void this.swipeService.swipeLeft();
    }
  }

  pass(): void {
    this.cardComponents?.first?.pass();
  }

  like(): void {
    this.cardComponents?.first?.like();
  }

  async openDetail(profile: User): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ProfileDetailModalComponent,
      componentProps: { profile },
      cssClass: 'profile-detail-modal',
    });
    await modal.present();
  }
}
