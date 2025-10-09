import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth-page/auth-page').then(m => m.AuthPageComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile-page/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'editor',
    loadComponent: () => import('./pages/post-editor-page/post-editor-page.component').then(m => m.PostEditorPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./pages/post-editor-page/post-editor-page.component').then(m => m.PostEditorPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./pages/post-detail-page/post-detail-page.component').then(m => m.PostDetailPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
