import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'nombre-pagina',
    loadComponent: () => import('./nombre-pagina/nombre-pagina.page').then( m => m.NombrePaginaPage)
  },
  {
    path: '',
    loadChildren: () => import('./ts-pages/ts-pages.routes').then( m => m.routes)
  },
  {
    path: '',
    loadChildren: () => import('./kk-pages/kk-pages.routes').then( m => m.routes)
  },
];
