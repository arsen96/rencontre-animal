import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TotemRevealPage } from './totem-reveal.page';

const routes: Routes = [
  {
    path: '',
    component: TotemRevealPage,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [TotemRevealPage],
})
export class TotemRevealPageModule {}
