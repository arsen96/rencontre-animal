import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Animal } from '../../core/interfaces/animal.interface';
import { User } from '../../core/interfaces/user.interface';
import { AffinityService } from '../../core/services/affinity.service';
import { AnimalService } from '../../core/services/animal.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { UserDataService } from '../../core/services/user-data.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { withDistanceFrom } from '../../core/utils/distance.util';
import { isDiscoverableProfile, normalizeUser } from '../../core/utils/user.utils';
import { ProfileDetailModalComponent } from '../../shared/components/profile-detail-modal/profile-detail-modal.component';

@Component({
  selector: 'app-explore-users',
  templateUrl: './explore-users.page.html',
  styleUrls: ['./explore-users.page.scss'],
  standalone: false,
})
export class ExploreUsersPage implements OnInit {
  animal?: Animal;
  users: User[] = [];
  loading = true;
  openingChatFor: string | null = null;
  affinityPercent?: number;
  reason = '';
  isSameTotem = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly animalService: AnimalService,
    private readonly affinityService: AffinityService,
    private readonly userData: UserDataService,
    private readonly session: UserSessionService,
    private readonly auth: AuthService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController
  ) {}

  async ngOnInit(): Promise<void> {
    const animalId = this.route.snapshot.paramMap.get('animalId');
    if (!animalId) {
      void this.router.navigate(['/tabs/explore']);
      return;
    }

    await this.session.ensureCurrentUser();
    this.animal = await this.animalService.getAnimalById(animalId);
    if (!this.animal) {
      void this.router.navigate(['/tabs/explore']);
      return;
    }

    const me = this.session.currentUser;
    this.isSameTotem = !!me?.animal?.id && me.animal.id === animalId;
    if (me?.animal && !this.isSameTotem) {
      const affinity = this.affinityService.affinityBetween(
        this.animalService.enrichAnimal(me.animal),
        this.animal
      );
      this.affinityPercent = affinity.percent;
      this.reason = affinity.reason;
    } else if (this.isSameTotem) {
      this.reason = '';
      this.affinityPercent = undefined;
    }

    await this.loadUsers(animalId);
  }

  goBack(): void {
    void this.router.navigate(['/tabs/explore']);
  }

  async openProfile(user: User): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ProfileDetailModalComponent,
      componentProps: { profile: user },
      cssClass: 'profile-detail-modal',
    });
    await modal.present();
  }

  async openChat(user: User): Promise<void> {
    this.openingChatFor = user.id;
    try {
      const conversation = await this.chatService.openOrCreateWithUser(user);
      await this.router.navigate(['/chat', conversation.id]);
    } catch (error) {
      console.error('Failed to open conversation', error);
    } finally {
      this.openingChatFor = null;
    }
  }

  private async loadUsers(animalId: string): Promise<void> {
    this.loading = true;
    try {
      const me = this.session.currentUser;
      const uid = this.auth.uid;
      const all = await this.userData.getUsersByAnimalId(animalId);
      let list = all
        .map((u) => normalizeUser(this.animalService.enrichUser(u)))
        .filter((u) => u.id !== uid && isDiscoverableProfile(u));

      if (me) {
        list = list
          .map((u) => withDistanceFrom(me, u))
          .sort((a, b) => {
            const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
            const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
            if (da !== db) {
              return da - db;
            }
            return a.displayName.localeCompare(b.displayName);
          });
      }

      this.users = list;
    } finally {
      this.loading = false;
    }
  }
}
