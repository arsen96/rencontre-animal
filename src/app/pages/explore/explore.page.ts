import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { Subscription, combineLatest } from 'rxjs';
import { AnimalAffinity, AffinityService } from '../../core/services/affinity.service';
import { AnimalService } from '../../core/services/animal.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { UserDataService } from '../../core/services/user-data.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { User } from '../../core/interfaces/user.interface';
import { withDistanceFrom } from '../../core/utils/distance.util';
import { isDiscoverableProfile, normalizeUser } from '../../core/utils/user.utils';
import { ProfileDetailModalComponent } from '../../shared/components/profile-detail-modal/profile-detail-modal.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit, OnDestroy, ViewWillEnter {
  affinities: AnimalAffinity[] = [];
  sameTotemUsers: User[] = [];
  /** Discoverable people count per animal id (excluding current user). */
  peopleCountByAnimal: Record<string, number> = {};
  user: User | null = null;
  loading = true;
  loadingPeople = true;
  openingChatFor: string | null = null;
  private sub?: Subscription;

  constructor(
    private readonly session: UserSessionService,
    private readonly animalService: AnimalService,
    private readonly affinityService: AffinityService,
    private readonly userData: UserDataService,
    private readonly auth: AuthService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([this.session.currentUser$, this.animalService.animals$]).subscribe(
      ([user, animals]) => {
        if (!user?.animal || animals.length === 0) {
          this.loading = !user;
          return;
        }
        this.user = this.animalService.enrichUser(user);
        this.affinities = this.affinityService.getAffinities(this.user.animal, animals, 12);
        this.loading = false;
        void this.loadPeople();
      }
    );

    void this.session.ensureCurrentUser();
  }

  ionViewWillEnter(): void {
    void this.loadPeople();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  peopleCount(animalId: string): number {
    return this.peopleCountByAnimal[animalId] ?? 0;
  }

  openUsers(item: AnimalAffinity): void {
    void this.router.navigate(['/tabs/explore/users', item.animal.id]);
  }

  async openProfile(profile: User): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ProfileDetailModalComponent,
      componentProps: { profile },
      cssClass: 'profile-detail-modal',
    });
    await modal.present();
  }

  async openChat(profile: User): Promise<void> {
    this.openingChatFor = profile.id;
    try {
      const conversation = await this.chatService.openOrCreateWithUser(profile);
      await this.router.navigate(['/chat', conversation.id]);
    } catch (error) {
      console.error('Failed to open conversation', error);
    } finally {
      this.openingChatFor = null;
    }
  }

  private async loadPeople(): Promise<void> {
    const me = this.session.currentUser ?? this.user;
    const uid = this.auth.uid;
    const myAnimalId = me?.animal?.id;
    if (!me || !uid || !myAnimalId) {
      this.sameTotemUsers = [];
      this.peopleCountByAnimal = {};
      this.loadingPeople = false;
      return;
    }

    this.loadingPeople = true;
    try {
      const all = await this.userData.getAllUsers();
      const discoverable = all
        .map((u) => normalizeUser(this.animalService.enrichUser(u)))
        .filter((u) => u.id !== uid && isDiscoverableProfile(u) && !!u.animal?.id);

      const counts: Record<string, number> = {};
      for (const profile of discoverable) {
        const id = profile.animal.id;
        counts[id] = (counts[id] ?? 0) + 1;
      }
      this.peopleCountByAnimal = counts;

      let sameTotem = discoverable.filter((u) => u.animal.id === myAnimalId);
      sameTotem = sameTotem
        .map((u) => withDistanceFrom(me, u))
        .sort((a, b) => {
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          if (da !== db) {
            return da - db;
          }
          return a.displayName.localeCompare(b.displayName);
        });
      this.sameTotemUsers = sameTotem;
    } catch (error) {
      console.error('Failed to load explore people', error);
      this.sameTotemUsers = [];
      this.peopleCountByAnimal = {};
    } finally {
      this.loadingPeople = false;
    }
  }
}
