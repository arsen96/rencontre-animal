import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() cardClick = new EventEmitter<Animal>();

  onClick(): void {
    this.cardClick.emit(this.animal);
  }
}
