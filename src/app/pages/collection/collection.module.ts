import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CollectionDetailPage } from './collection-detail.page';
import { CollectionPage } from './collection.page';

const routes: Routes = [
  { path: '', component: CollectionPage },
  { path: ':animalId', component: CollectionDetailPage },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [CollectionPage, CollectionDetailPage],
})
export class CollectionPageModule {}
