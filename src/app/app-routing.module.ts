import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authRedirectGuard } from './core/guards/auth-redirect.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    canActivate: [authRedirectGuard],
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingPageModule),
  },
  {
    path: 'login',
    canActivate: [authRedirectGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'birthdate',
    loadChildren: () =>
      import('./pages/birthdate/birthdate.module').then((m) => m.BirthdatePageModule),
  },
  {
    path: 'gender',
    loadChildren: () =>
      import('./pages/gender/gender.module').then((m) => m.GenderPageModule),
  },
  {
    path: 'personality-quiz',
    loadChildren: () =>
      import('./pages/personality-quiz/personality-quiz.module').then(
        (m) => m.PersonalityQuizPageModule
      ),
  },
  {
    path: 'totem-reveal',
    loadChildren: () =>
      import('./pages/totem-reveal/totem-reveal.module').then((m) => m.TotemRevealPageModule),
  },
  {
    path: 'animal-select',
    loadChildren: () =>
      import('./pages/animal-select/animal-select.module').then(
        (m) => m.AnimalSelectPageModule
      ),
  },
  {
    path: 'profile-create',
    loadChildren: () =>
      import('./pages/profile-create/profile-create.module').then(
        (m) => m.ProfileCreatePageModule
      ),
  },
  {
    path: 'user-profile',
    loadChildren: () =>
      import('./pages/user-profile/user-profile.module').then((m) => m.UserProfilePageModule),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'chats',
    loadChildren: () =>
      import('./pages/chats/chats.module').then((m) => m.ChatsPageModule),
  },
  {
    path: 'chat/:conversationId',
    loadChildren: () =>
      import('./pages/chat/chat.module').then((m) => m.ChatPageModule),
  },
  { path: 'jungle', redirectTo: 'tabs/my-card', pathMatch: 'full' },
  { path: 'match', redirectTo: 'tabs/explore', pathMatch: 'full' },
  { path: 'preferences', redirectTo: 'personality-quiz', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
