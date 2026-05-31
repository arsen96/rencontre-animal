import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MOCK_DISCOVERY_PROFILES } from '../data/mock-profiles.data';
import { Match } from '../interfaces/match.interface';
import { AgeRange, User } from '../interfaces/user.interface';
import { ChatService } from './chat.service';

@Injectable({ providedIn: 'root' })
export class SwipeService {
  private deck: User[] = [];
  private likeCount = 0;
  private readonly deckSubject = new BehaviorSubject<User[]>([]);
  private readonly lastMatchSubject = new BehaviorSubject<Match | null>(null);

  constructor(private readonly chatService: ChatService) {}

  readonly deck$ = this.deckSubject.asObservable();
  readonly lastMatch$ = this.lastMatchSubject.asObservable();

  get currentCard(): User | null {
    return this.deck[0] ?? null;
  }

  get remainingCount(): number {
    return this.deck.length;
  }

  initDeck(ageRange?: AgeRange): void {
    let profiles = [...MOCK_DISCOVERY_PROFILES];
    if (ageRange) {
      profiles = profiles.filter(
        (p) => p.age >= ageRange.min && p.age <= ageRange.max
      );
    }
    this.deck = profiles.sort(() => Math.random() - 0.5);
    this.likeCount = 0;
    this.deckSubject.next([...this.deck]);
    this.lastMatchSubject.next(null);
  }

  swipeLeft(): void {
    this.removeTop();
  }

  swipeRight(): Match | null {
    const profile = this.deck[0];
    if (!profile) {
      return null;
    }

    this.likeCount++;
    let match: Match | null = null;

    // Simulation : match au 2e like ou aléatoire ~35 %
    if (this.likeCount === 2 || Math.random() < 0.35) {
      match = {
        id: `match-${profile.id}-${Date.now()}`,
        matchedAt: new Date(),
        user: profile,
        isNew: true,
      };
      const conversation = this.chatService.createFromMatch(match);
      match.conversationId = conversation.id;
      this.lastMatchSubject.next(match);
    }

    this.removeTop();
    return match;
  }

  clearLastMatch(): void {
    this.lastMatchSubject.next(null);
  }

  private removeTop(): void {
    this.deck = this.deck.slice(1);
    this.deckSubject.next([...this.deck]);
  }
}
