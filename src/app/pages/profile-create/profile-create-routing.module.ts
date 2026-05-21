import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileCreatePage } from './profile-create.page';

const routes: Routes = [{ path: '', component: ProfileCreatePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileCreatePageRoutingModule {}
