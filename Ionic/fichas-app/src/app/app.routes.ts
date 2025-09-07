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
    path: 'accordions',
    loadComponent: () => import('./accordions-page/accordions.page').then( m => m.AccordionsPage)
  },
];
