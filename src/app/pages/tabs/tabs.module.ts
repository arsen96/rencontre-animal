import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'my-card',
        loadChildren: () =>
          import('../my-card/my-card.module').then((m) => m.MyCardPageModule),
      },
      {
        path: 'collection',
        loadChildren: () =>
          import('../collection/collection.module').then((m) => m.CollectionPageModule),
      },
      {
        path: 'explore',
        loadChildren: () =>
          import('../explore/explore.module').then((m) => m.ExplorePageModule),
      },
      {
        path: '',
        redirectTo: 'my-card',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [TabsPage],
})
export class TabsPageModule {}
