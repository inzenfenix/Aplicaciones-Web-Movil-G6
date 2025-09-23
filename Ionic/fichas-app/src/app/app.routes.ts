import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ts',
    loadChildren: () =>
      import('./ts-pages/ts-pages.routes').then((m) => m.routes),
  },
  {
    path: 'kk',
    loadChildren: () =>
      import('./kk-pages/kk-pages.routes').then((m) => m.routes),
  },
  {
    path: 'ct',
    loadChildren: () =>
      import('./ct-pages/ct-pages.routes').then((m) => m.routes),
  },
  {
    path: 'relevant-information',
    loadComponent: () => import('./relevant-information/relevant-information.page').then( m => m.RelevantInformationPage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./home-page/home-page.page').then((m) => m.HomePagePage),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
  

];
