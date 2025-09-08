import { Routes } from '@angular/router';
import { KKPage as CTPage } from './ct-pages.page';

export const routes: Routes = [
  {
    path: '',
    component: CTPage,
    children: [
      {
        path: 'c-accordions',
        loadComponent: () =>
          import('../CT/accordions-page/c-accordions.page').then(
            (m) => m.AccordionsPage
          ),
      },
      {
        path: 'luna',
        loadComponent: () =>
          import('../CT/luna/luna.page').then((m) => m.LunaPage),
      },
      {
        path: 'alerta',
        loadComponent: () =>
          import('../CT/alerta/alerta.page').then((m) => m.AlertaPage),
      },
      {
        path: 'todolist',
        loadComponent: () =>
          import('../CT/to-do-list/to-do-list.page').then(
            (m) => m.ToDoListPage
          ),
      },
      {
        path: 'cats',
        loadComponent: () =>
          import('../CT/cats/cats.page').then((m) => m.CatsPage),
      },
      {
        path: 'facts',
        loadComponent: () =>
          import('../CT/facts/facts.page').then((m) => m.FactsPage),
      },
      {
        path: '',
        redirectTo: 'c-accordions',
        pathMatch: 'full',
      },
    ],
  },
];
