import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'nombre-pagina',
    loadComponent: () =>
      import('./nombre-pagina/nombre-pagina.page').then(
        (m) => m.NombrePaginaPage
      ),
  },
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
