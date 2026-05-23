import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-jungle-background',
  templateUrl: './jungle-background.component.html',
  styleUrls: ['./jungle-background.component.scss'],
  standalone: false,
})
export class JungleBackgroundComponent {
  @Input() variant: 'full' | 'subtle' = 'full';
}
