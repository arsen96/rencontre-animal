import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimalSelectPage } from './animal-select.page';

const routes: Routes = [{ path: '', component: AnimalSelectPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnimalSelectPageRoutingModule {}
