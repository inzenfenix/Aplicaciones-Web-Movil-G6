import { Routes } from '@angular/router';
import { KKPage as CTPage } from './ct-pages.page';

export const routes: Routes = [
  {
    path: 'ct',
    component: CTPage,
    children: [
      {
        path: 'accordions',
        loadComponent: () =>
          import('../CT/accordions-page/accordions.page').then(
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
