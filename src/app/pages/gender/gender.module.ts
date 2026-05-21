import { NgModule } from '@angular/core';
import { GenderPageRoutingModule } from './gender-routing.module';
import { GenderPage } from './gender.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, GenderPageRoutingModule],
  declarations: [GenderPage],
})
export class GenderPageModule {}
