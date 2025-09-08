import { Routes } from '@angular/router';
import { TomySPage } from './ts-pages.page';

export const routes: Routes = [
  {
    path: '',
    component: TomySPage,
    children: [
      {
        path: 'accordions',
        loadComponent: () =>
          import('../TSS/accordions-page/accordions.page').then(
            (m) => m.AccordionsPage
          ),
      },
      {
        path: 'top10pages',
        loadComponent: () =>
          import('../TSS/top10-pages/top10-pages.page').then(
            (m) => m.Top10PagesPage
          ),
      },
      {
        path: 'input-stuff',
        loadComponent: () =>
          import('../TSS/input-stuff/input-stuff.page').then(
            (m) => m.InputStuffPage
          ),
      },
      {
        path: 'cards2-therebellion',
        loadComponent: () =>
          import('../TSS/cards2-therebellion/cards2-therebellion.page').then(
            (m) => m.Cards2TherebellionPage
          ),
      },
      {
        path: 'water-buttons',
        loadComponent: () =>
          import('../TSS/water-buttons/water-buttons.page').then(
            (m) => m.WaterButtonsPage
          ),
      },
      {
        path: '',
        redirectTo: 'accordions',
        pathMatch: 'full',
      },
      {
        path: 'actions-and-sheets',
        loadComponent: () =>
          import('../TSS/actions-and-sheets/actions-and-sheets.page').then(
            (m) => m.ActionsAndSheetsPage
          ),
      },
    ],
  },
];
