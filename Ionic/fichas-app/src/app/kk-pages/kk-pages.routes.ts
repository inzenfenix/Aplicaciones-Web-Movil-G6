import { Routes } from '@angular/router';
import { KKPage } from './kk-pages.page';

export const routes: Routes = [
  {
    path: 'kk',
    component: KKPage,
    children: [
      {
        path: 'accordions',
        loadComponent: () =>
          import('../KK/accordions-page/accordions.page').then(
            (m) => m.AccordionsPage
          ),
      },
      {
        path: '',
        redirectTo: 'accordions',
        pathMatch: 'full',
      },
    ],
  },
];
