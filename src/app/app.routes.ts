import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/generator/generator.component')
      .then(m => m.GeneratorComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component')
      .then(m => m.HistoryComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
