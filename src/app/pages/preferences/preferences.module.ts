import { NgModule } from '@angular/core';
import { PreferencesPageRoutingModule } from './preferences-routing.module';
import { PreferencesPage } from './preferences.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, PreferencesPageRoutingModule],
  declarations: [PreferencesPage],
})
export class PreferencesPageModule {}
