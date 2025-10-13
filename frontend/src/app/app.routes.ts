import { Routes } from '@angular/router';
import { Auth } from './auth/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { HomePageComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: '' , component: HomePageComponent , canActivate: [AuthGuard] },
  // { path: '', redirectTo: '/auth', pathMatch: 'full' }
];
