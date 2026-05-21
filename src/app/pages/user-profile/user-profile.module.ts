import { NgModule } from '@angular/core';
import { UserProfilePageRoutingModule } from './user-profile-routing.module';
import { UserProfilePage } from './user-profile.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, UserProfilePageRoutingModule],
  declarations: [UserProfilePage],
})
export class UserProfilePageModule {}
