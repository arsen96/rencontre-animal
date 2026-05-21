import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BirthdatePageRoutingModule } from './birthdate-routing.module';
import { BirthdatePage } from './birthdate.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, FormsModule, BirthdatePageRoutingModule],
  declarations: [BirthdatePage],
})
export class BirthdatePageModule {}
