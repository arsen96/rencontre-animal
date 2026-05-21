import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-header',
  templateUrl: './step-header.component.html',
  styleUrls: ['./step-header.component.scss'],
  standalone: false,
})
export class StepHeaderComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 6;

  get steps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }
}
