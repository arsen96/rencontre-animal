import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PersonalityQuizPage } from './personality-quiz.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalityQuizPage,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [PersonalityQuizPage],
})
export class PersonalityQuizPageModule {}
