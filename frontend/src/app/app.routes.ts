import { Routes } from '@angular/router';
import { Auth } from './auth/auth/auth.component';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: '', redirectTo: '/auth', pathMatch: 'full' }
];
