import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BirthdatePage } from './birthdate.page';

const routes: Routes = [{ path: '', component: BirthdatePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BirthdatePageRoutingModule {}
