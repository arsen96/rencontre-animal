import { Component, Input } from '@angular/core';
import { Animal } from '../../../core/interfaces/animal.interface';

@Component({
  selector: 'app-animal-avatar',
  templateUrl: './animal-avatar.component.html',
  styleUrls: ['./animal-avatar.component.scss'],
  standalone: false,
})
export class AnimalAvatarComponent {
  @Input({ required: true }) animal!: Animal;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() variant: 'inline' | 'fill' | 'circle' | 'card' = 'inline';
}
