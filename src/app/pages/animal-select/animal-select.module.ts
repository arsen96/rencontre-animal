import { NgModule } from '@angular/core';
import { AnimalDetailPage } from './animal-detail.page';
import { AnimalSelectPageRoutingModule } from './animal-select-routing.module';
import { AnimalSelectPage } from './animal-select.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, AnimalSelectPageRoutingModule],
  declarations: [AnimalSelectPage, AnimalDetailPage],
})
export class AnimalSelectPageModule {}
