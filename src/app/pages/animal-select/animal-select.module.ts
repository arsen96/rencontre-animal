import { NgModule } from '@angular/core';
import { AnimalSelectPageRoutingModule } from './animal-select-routing.module';
import { AnimalSelectPage } from './animal-select.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, AnimalSelectPageRoutingModule],
  declarations: [AnimalSelectPage],
})
export class AnimalSelectPageModule {}
