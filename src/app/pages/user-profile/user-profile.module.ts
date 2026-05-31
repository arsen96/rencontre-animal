import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfilePageRoutingModule } from './user-profile-routing.module';
import { UserProfilePage } from './user-profile.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, FormsModule, UserProfilePageRoutingModule],
  declarations: [UserProfilePage],
})
export class UserProfilePageModule {}
