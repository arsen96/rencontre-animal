import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MyCardPage } from './my-card.page';

const routes: Routes = [{ path: '', component: MyCardPage }];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [MyCardPage],
})
export class MyCardPageModule {}
