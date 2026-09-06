import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { Animal } from '../../../core/interfaces/animal.interface';

@Component({
  selector: 'app-animal-flip-card',
  templateUrl: './animal-flip-card.component.html',
  styleUrls: ['./animal-flip-card.component.scss'],
  standalone: false,
})
export class AnimalFlipCardComponent {
  @Input() animal!: Animal;
  @Input() selected = false;
  @Input() flipped = false;
  @Input() expanded = false;
  /** Navigate on tap (collection grid). Ignored when flipInteractive is true. */
  @Input() clickable = true;
  /** Tap or horizontal swipe toggles photo ↔ text with the flip animation. */
  @Input() flipInteractive = false;
  @Output() cardClick = new EventEmitter<Animal>();
  @Output() flippedChange = new EventEmitter<boolean>();

  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerActive = false;
  private didSwipe = false;

  @HostBinding('class.is-expanded')
  get hostExpanded(): boolean {
    return this.expanded;
  }

  @HostBinding('class.flip-interactive')
  get hostFlipInteractive(): boolean {
    return this.flipInteractive;
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.flipInteractive) {
      return;
    }
    this.pointerActive = true;
    this.didSwipe = false;
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.pointerActive || !this.flipInteractive) {
      return;
    }
    const dx = event.clientX - this.pointerStartX;
    const dy = event.clientY - this.pointerStartY;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      this.didSwipe = true;
      this.pointerActive = false;
      // Swipe left → texte, swipe right → photo
      this.setFlipped(dx < 0);
    }
  }

  onPointerUp(): void {
    this.pointerActive = false;
  }

  onClick(): void {
    if (this.flipInteractive) {
      if (this.didSwipe) {
        this.didSwipe = false;
        return;
      }
      this.toggleFlip();
      return;
    }

    if (!this.clickable) {
      return;
    }

    this.cardClick.emit(this.animal);
  }

  showPhoto(): void {
    this.setFlipped(false);
  }

  showText(): void {
    this.setFlipped(true);
  }

  private toggleFlip(): void {
    this.setFlipped(!this.flipped);
  }

  private setFlipped(value: boolean): void {
    if (this.flipped === value) {
      return;
    }
    this.flipped = value;
    this.flippedChange.emit(value);
  }
}
