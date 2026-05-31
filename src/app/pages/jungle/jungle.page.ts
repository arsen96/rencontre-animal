import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../../core/interfaces/user.interface';
import { ChatService } from '../../core/services/chat.service';
import { SwipeService } from '../../core/services/swipe.service';
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
export class JunglePage implements OnInit, OnDestroy {
  deck: User[] = [];
  unreadChats = 0;
  @ViewChildren(SwipeCardComponent) cardComponents!: QueryList<SwipeCardComponent>;

  private unreadSub?: Subscription;

  constructor(
    private readonly swipeService: SwipeService,
    private readonly chatService: ChatService,
    private readonly modalCtrl: ModalController,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.swipeService.initDeck();
    this.swipeService.deck$.subscribe((deck) => {
      this.deck = deck;
    });
    this.unreadSub = this.chatService.totalUnread$.subscribe((n) => {
      this.unreadChats = n;
    });
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
  }

  openChats(): void {
    this.router.navigate(['/chats']);
  }

  openProfile(): void {
    this.router.navigate(['/user-profile']);
  }

  get visibleCards(): User[] {
    return this.deck.slice(0, 3);
  }

  get isEmpty(): boolean {
    return this.deck.length === 0;
  }

  onSwiped(direction: SwipeDirection): void {
    if (direction === 'right') {
      const match = this.swipeService.swipeRight();
      if (match) {
        this.router.navigate(['/match'], {
          state: { match },
        });
        return;
      }
    } else {
      this.swipeService.swipeLeft();
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
