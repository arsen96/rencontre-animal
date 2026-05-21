import { NgModule } from '@angular/core';
import { JunglePageRoutingModule } from './jungle-routing.module';
import { JunglePage } from './jungle.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, JunglePageRoutingModule],
  declarations: [JunglePage],
})
export class JunglePageModule {}
