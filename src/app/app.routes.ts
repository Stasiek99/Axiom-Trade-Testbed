import { Routes } from '@angular/router';
import { ChartComponent } from './features/chart/chart.component';

export const routes: Routes = [
  { path: '', component: ChartComponent },
  {
    path: 'strategy',
    loadComponent: () =>
      import('./features/strategy-builder/strategy-builder.component')
        .then(m => m.StrategyBuilderComponent),
  },
  {
    path: 'learn',
    loadComponent: () =>
      import('./features/learn/learn.component')
        .then(m => m.LearnComponent),
  },
];
