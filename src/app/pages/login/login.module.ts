import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, FormsModule, LoginPageRoutingModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
