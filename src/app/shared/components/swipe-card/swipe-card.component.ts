import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { User } from '../../../core/interfaces/user.interface';

export type SwipeDirection = 'left' | 'right';

@Component({
  selector: 'app-swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss'],
  standalone: false,
})
export class SwipeCardComponent implements OnDestroy {
  @Input() profile!: User;
  @Input() stackIndex = 0;
  @Input() interactive = true;
  @Output() swiped = new EventEmitter<SwipeDirection>();
  @Output() detailClick = new EventEmitter<User>();

  @ViewChild('cardEl') cardEl!: ElementRef<HTMLElement>;

  offsetX = 0;
  offsetY = 0;
  rotation = 0;
  dragging = false;
  exiting = false;

  private startX = 0;
  private startY = 0;
  private active = false;
  private moved = false;

  private readonly onMove = (e: PointerEvent) => this.handleMove(e);
  private readonly onUp = (e: PointerEvent) => this.handleEnd(e);

  get likeOpacity(): number {
    return Math.min(Math.max(this.offsetX / 120, 0), 1);
  }

  get passOpacity(): number {
    return Math.min(Math.max(-this.offsetX / 120, 0), 1);
  }

  get genderIcon(): string {
    switch (this.profile?.gender) {
      case 'male':
        return 'male';
      case 'femelle':
        return 'female';
      default:
        return 'male-female';
    }
  }

  ngOnDestroy(): void {
    this.detachListeners();
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.interactive || this.stackIndex > 0 || this.exiting) {
      return;
    }
    this.active = true;
    this.dragging = true;
    this.moved = false;
    this.startX = event.clientX;
    this.startY = event.clientY;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  openDetail(event: Event): void {
    event.stopPropagation();
    this.detailClick.emit(this.profile);
  }

  openDetailFromImage(event: Event): void {
    if (this.moved || this.exiting) {
      return;
    }
    event.stopPropagation();
    this.detailClick.emit(this.profile);
  }

  pass(): void {
    this.animateExit('left');
  }

  like(): void {
    this.animateExit('right');
  }

  private handleMove(event: PointerEvent): void {
    if (!this.active) {
      return;
    }
    this.offsetX = event.clientX - this.startX;
    this.offsetY = (event.clientY - this.startY) * 0.35;
    this.rotation = this.offsetX * 0.06;
    if (Math.abs(this.offsetX) > 6 || Math.abs(event.clientY - this.startY) > 6) {
      this.moved = true;
    }
  }

  private handleEnd(event: PointerEvent): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.dragging = false;
    this.detachListeners();

    const threshold = 100;
    if (this.offsetX > threshold) {
      this.animateExit('right');
    } else if (this.offsetX < -threshold) {
      this.animateExit('left');
    } else {
      this.resetPosition();
    }
  }

  private animateExit(direction: SwipeDirection): void {
    this.exiting = true;
    this.offsetX = direction === 'right' ? 420 : -420;
    this.rotation = direction === 'right' ? 18 : -18;
    setTimeout(() => this.swiped.emit(direction), 280);
  }

  private resetPosition(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0;
  }

  private detachListeners(): void {
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
  }
}
