import { Routes } from '@angular/router';
import { KKPage } from './kk-pages.page';

export const routes: Routes = [
  {
    path: 'kk',
    component: KKPage,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../KK/klaus1/klaus1.page').then(
            (m) => m.Klaus1Page
          ),
      },
      {
        path:'kk1',
        loadComponent: () =>
          import('../KK/klaus1/klaus1.page').then(
            (m) => m.Klaus1Page
          ),
      },
      {
        path:'kk2',
        loadComponent: () =>
          import('../KK/klaus2/klaus2.page').then(
            (m) => m.Klaus2Page
          ),
      },
      {
        path:'kk3',
        loadComponent: () =>
          import('../KK/klaus3/klaus3.page').then(
            (m) => m.Klaus3Page
          ),
      },
      {
        path:'kk4',
        loadComponent: () =>
          import('../KK/klaus4/klaus4.page').then(
            (m) => m.Klaus4Page
          ),
      },
      {
        path:'kk5',
        loadComponent: () =>
          import('../KK/klaus5/klaus5.page').then(
            (m) => m.Klaus5Page
          ),
      },
      {
        path:'kk6',
        loadComponent: () =>
          import('../KK/klaus6/klaus6.page').then(
            (m) => m.Klaus6Page
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
