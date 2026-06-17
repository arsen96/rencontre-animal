import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimalDetailPage } from './animal-detail.page';
import { AnimalSelectPage } from './animal-select.page';

const routes: Routes = [
  { path: '', component: AnimalSelectPage },
  { path: ':animalId', component: AnimalDetailPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnimalSelectPageRoutingModule {}
