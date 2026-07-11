import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Match } from '../interfaces/match.interface';
import { AgeRange, User } from '../interfaces/user.interface';
import {
  isDiscoverableProfile,
  normalizeUser,
  resolveAge,
} from '../utils/user.utils';
import {
  DISCOVERY_DISTANCE_TIERS_KM,
  getDiscoveryTierIndex,
  getDiscoveryTierLabel,
  sortUsersByDistance,
  withDistanceFrom,
} from '../utils/distance.util';
import { AnimalService } from './animal.service';
import { ChatService } from './chat.service';
import { SwipeDataService } from './swipe-data.service';
import { UserDataService } from './user-data.service';

const DEFAULT_AGE_RANGE: AgeRange = { min: 18, max: 45 };

@Injectable({ providedIn: 'root' })
export class SwipeService implements OnDestroy {
  private deck: User[] = [];
  private passedProfiles: User[] = [];
  private profilePool: User[] = [];
  private currentTierIndex = 0;
  private currentUser: User | null = null;
  private readonly deckSubject = new BehaviorSubject<User[]>([]);
  private readonly passedProfilesSubject = new BehaviorSubject<User[]>([]);
  private readonly lastMatchSubject = new BehaviorSubject<Match | null>(null);
  private animalsSub?: Subscription;

  constructor(
    private readonly animalService: AnimalService,
    private readonly chatService: ChatService,
    private readonly swipeData: SwipeDataService,
    private readonly userData: UserDataService
  ) {
    this.animalsSub = this.animalService.animals$.subscribe(() => {
      this.refreshCatalogOnProfiles();
    });
  }

  ngOnDestroy(): void {
    this.animalsSub?.unsubscribe();
  }

  readonly deck$ = this.deckSubject.asObservable();
  readonly passedProfiles$ = this.passedProfilesSubject.asObservable();
  readonly lastMatch$ = this.lastMatchSubject.asObservable();

  get currentCard(): User | null {
    return this.deck[0] ?? null;
  }

  get remainingCount(): number {
    return this.deck.length;
  }

  get hasPassedProfiles(): boolean {
    return this.passedProfiles.length > 0;
  }

  get passedCount(): number {
    return this.passedProfiles.length;
  }

  get discoveryExpanded(): boolean {
    return this.currentTierIndex > 0;
  }

  get discoveryTierLabel(): string | null {
    return getDiscoveryTierLabel(this.currentTierIndex);
  }

  get discoveryTierIndex(): number {
    return this.currentTierIndex;
  }

  get discoveryTierLimitKm(): number | null {
    const limit = DISCOVERY_DISTANCE_TIERS_KM[this.currentTierIndex];
    return limit === Infinity ? null : limit;
  }

  async initDeck(currentUser: User, force = false): Promise<void> {
    const normalizedCurrentUser = normalizeUser(currentUser);
    this.currentUser = normalizedCurrentUser;

    if (force) {
      this.passedProfiles = [];
      this.emitPassedProfiles();
      this.currentTierIndex = 0;
    } else if (this.deck.length === 0 && this.passedProfiles.length > 0) {
      return;
    }

    this.lastMatchSubject.next(null);

    const ageRange = currentUser.ageRange ?? DEFAULT_AGE_RANGE;

    let swipedIds = new Set<string>();
    try {
      swipedIds = await this.swipeData.getSwipedUserIds(normalizedCurrentUser.id);
    } catch (error) {
      console.error('Failed to load swipes from Firestore', error);
    }

    let allUsers: User[] = [];
    try {
      allUsers = (await this.userData.getAllUsers()).map((profile) =>
        this.animalService.enrichUser(normalizeUser(profile))
      );
    } catch (error) {
      console.error('Failed to load users from Firestore', error);
    }

    const profiles = allUsers
      .filter(
        (profile) =>
          profile.id !== normalizedCurrentUser.id &&
          !swipedIds.has(profile.id) &&
          isDiscoverableProfile(profile) &&
          this.matchesDiscoveryFilters(profile, normalizedCurrentUser, ageRange)
      );

    this.profilePool = sortUsersByDistance(
      profiles.map((profile) => withDistanceFrom(normalizedCurrentUser, profile))
    );
    this.currentTierIndex = 0;
    this.refillDeckFromTiers();
    await this.syncPassedProfiles(normalizedCurrentUser, allUsers, ageRange);
    this.emitPassedProfiles();
  }

  private async syncPassedProfiles(
    currentUser: User,
    allUsers: User[],
    ageRange: AgeRange
  ): Promise<void> {
    if (this.passedProfiles.length > 0) {
      return;
    }

    try {
      const passedIds = await this.swipeData.getPassedUserIds(currentUser.id);
      if (passedIds.size === 0) {
        return;
      }

      this.passedProfiles = allUsers
        .filter(
          (profile) =>
            passedIds.has(profile.id) &&
            profile.id !== currentUser.id &&
            isDiscoverableProfile(profile) &&
            this.matchesDiscoveryFilters(profile, currentUser, ageRange)
        )
        .map((profile) => this.animalService.enrichUser(profile));
      this.emitPassedProfiles();
    } catch (error) {
      console.error('Failed to load passed profiles from Firestore', error);
    }
  }

  async restartWithPassed(): Promise<void> {
    if (this.passedProfiles.length === 0) {
      return;
    }

    const uid = this.currentUser?.id;
    if (uid) {
      await Promise.all(
        this.passedProfiles.map((profile) =>
          this.swipeData.removeSwipe(uid, profile.id)
        )
      );
    }

    const currentUser = this.currentUser;
    this.deck = sortUsersByDistance(
      currentUser
        ? this.passedProfiles.map((profile) => withDistanceFrom(currentUser, profile))
        : [...this.passedProfiles]
    );
    this.passedProfiles = [];
    this.emitPassedProfiles();
    this.deckSubject.next([...this.deck]);
  }

  async swipeLeft(): Promise<void> {
    const profile = this.deck[0];
    if (!profile) {
      return;
    }

    this.passedProfiles.push(profile);
    this.emitPassedProfiles();

    const uid = this.currentUser?.id;
    if (uid) {
      try {
        await this.swipeData.recordSwipe(uid, profile.id, 'pass');
      } catch (error) {
        console.error('Failed to record pass', error);
      }
    }

    this.removeTop();
  }

  async swipeRight(): Promise<Match | null> {
    const profile = this.deck[0];
    if (!profile || !this.currentUser) {
      return null;
    }

    let match: Match | null = null;
    const uid = this.currentUser.id;

    try {
      await this.swipeData.recordSwipe(uid, profile.id, 'like');
      const isMutual = await this.swipeData.hasLikeFrom(profile.id, uid);
      if (isMutual) {
        match = await this.swipeData.createMatch(uid, profile);
        const conversation = this.chatService.createFromMatch(match);
        match.conversationId = conversation.id;
        this.lastMatchSubject.next(match);
      }
    } catch (error) {
      console.error('Failed to record like or create match', error);
    }

    this.removeTop();
    return match;
  }

  clearLastMatch(): void {
    this.lastMatchSubject.next(null);
  }

  async respondToReceivedLike(
    currentUser: User,
    profile: User,
    direction: 'like' | 'pass'
  ): Promise<Match | null> {
    const uid = currentUser.id;

    try {
      await this.swipeData.recordSwipe(uid, profile.id, direction);
      if (direction === 'pass') {
        return null;
      }

      const isMutual = await this.swipeData.hasLikeFrom(profile.id, uid);
      if (!isMutual) {
        return null;
      }

      const match = await this.swipeData.createMatch(uid, profile);
      const conversation = this.chatService.createFromMatch(match);
      match.conversationId = conversation.id;
      this.lastMatchSubject.next(match);
      return match;
    } catch (error) {
      console.error('Failed to respond to received like', error);
      return null;
    }
  }

  private matchesDiscoveryFilters(
    profile: User,
    currentUser: User,
    ageRange: AgeRange
  ): boolean {
    const profileAge = resolveAge(profile);
    const currentAge = resolveAge(currentUser);
    const effectiveRange = currentUser.ageRange ?? ageRange;

    if (profileAge === null || currentAge === null) {
      return false;
    }
    if (profileAge < effectiveRange.min || profileAge > effectiveRange.max) {
      return false;
    }
    if (
      currentUser.meetPreference !== 'tout' &&
      profile.gender !== currentUser.meetPreference
    ) {
      return false;
    }
    if (
      profile.meetPreference !== 'tout' &&
      profile.meetPreference !== currentUser.gender
    ) {
      return false;
    }
    return true;
  }

  private removeTop(): void {
    this.deck = this.deck.slice(1);

    if (this.deck.length === 0) {
      this.advanceToNextDistanceTier();
    } else {
      this.deckSubject.next([...this.deck]);
    }
  }

  private refillDeckFromTiers(): void {
    while (this.currentTierIndex < DISCOVERY_DISTANCE_TIERS_KM.length) {
      const candidates = this.getProfilesForTier(this.currentTierIndex);
      if (candidates.length > 0) {
        this.deck = candidates;
        this.deckSubject.next([...this.deck]);
        return;
      }
      this.currentTierIndex++;
    }

    this.deck = [];
    this.deckSubject.next([]);
  }

  private advanceToNextDistanceTier(): void {
    this.currentTierIndex++;
    this.refillDeckFromTiers();
  }

  private getProfilesForTier(tierIndex: number): User[] {
    return this.profilePool.filter(
      (profile) => getDiscoveryTierIndex(profile.distanceKm) === tierIndex
    );
  }

  private emitPassedProfiles(): void {
    this.passedProfilesSubject.next([...this.passedProfiles]);
  }

  private refreshCatalogOnProfiles(): void {
    if (
      this.deck.length === 0 &&
      this.passedProfiles.length === 0 &&
      this.profilePool.length === 0
    ) {
      return;
    }

    this.deck = this.deck.map((profile) => this.animalService.enrichUser(profile));
    this.passedProfiles = this.passedProfiles.map((profile) =>
      this.animalService.enrichUser(profile)
    );
    this.profilePool = this.profilePool.map((profile) =>
      this.animalService.enrichUser(profile)
    );
    this.deckSubject.next([...this.deck]);
    this.emitPassedProfiles();
  }
}
