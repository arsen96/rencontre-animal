import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss'],
  standalone: false,
})
export class PrimaryButtonComponent {
  @Input() label = 'Continuer';
  @Input() disabled = false;
  @Input() expand = true;
  @Input() variant: 'gold' | 'green' = 'gold';
  @Output() pressed = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.pressed.emit();
    }
  }
}
