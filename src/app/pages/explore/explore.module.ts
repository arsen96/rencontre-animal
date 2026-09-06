import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExplorePage } from './explore.page';
import { ExploreUsersPage } from './explore-users.page';

const routes: Routes = [
  { path: '', component: ExplorePage },
  { path: 'users/:animalId', component: ExploreUsersPage },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [ExplorePage, ExploreUsersPage],
})
export class ExplorePageModule {}
