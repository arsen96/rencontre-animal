import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  constructor(private readonly router: Router) {}

  continueGoogle(): void {
    this.router.navigate(['/birthdate']);
  }

  continueSms(): void {
    this.router.navigate(['/birthdate']);
  }
}
