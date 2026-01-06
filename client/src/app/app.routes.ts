import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'streamers',
    loadComponent: () => import('./components/streamers/streamers.component').then(m => m.StreamersComponent)
  },
  {
    path: 'streamers/:id',
    loadComponent: () => import('./components/streamer-detail/streamer-detail.component').then(m => m.StreamerDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
