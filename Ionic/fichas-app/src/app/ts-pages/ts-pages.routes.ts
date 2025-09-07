import { Routes } from '@angular/router';
import { TomySPage } from './ts-pages.page';

export const routes: Routes = [
  {
    path: 'tomys',
    component: TomySPage,
    children: [
      {
        path: 'accordions',
        loadComponent: () =>
          import('../accordions-page/accordions.page').then(
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
