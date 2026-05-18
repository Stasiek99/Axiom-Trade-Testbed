import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/chart/chart.component').then(m => m.ChartComponent),
  },
  {
    path: 'strategy',
    data: { preload: true },
    loadComponent: () =>
      import('./features/strategy-builder/strategy-builder.component')
        .then(m => m.StrategyBuilderComponent),
  },
  {
    path: 'statistics',
    data: { preload: true },
    loadComponent: () =>
      import('./features/statistics/statistics.component')
        .then(m => m.StatisticsComponent),
  },
  {
    path: 'learn',
    loadComponent: () =>
      import('./features/learn/learn.component')
        .then(m => m.LearnComponent),
  },
];
