import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileCreatePageRoutingModule } from './profile-create-routing.module';
import { ProfileCreatePage } from './profile-create.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, FormsModule, ProfileCreatePageRoutingModule],
  declarations: [ProfileCreatePage],
})
export class ProfileCreatePageModule {}
