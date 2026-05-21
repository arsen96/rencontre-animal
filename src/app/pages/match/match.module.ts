import { NgModule } from '@angular/core';
import { MatchPageRoutingModule } from './match-routing.module';
import { MatchPage } from './match.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, MatchPageRoutingModule],
  declarations: [MatchPage],
})
export class MatchPageModule {}
