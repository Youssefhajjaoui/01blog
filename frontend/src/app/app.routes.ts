import { Routes } from '@angular/router';
import { Auth } from './auth/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { HomePageComponent } from './home/home.component';
import { PostCreate } from './components/post-create/post-create';
import { ProfileComponent } from './profile/profile.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: 'create-post', component: PostCreate, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'profile/:userId',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: '', component: HomePageComponent, canActivate: [AuthGuard] },
  // { path: '', redirectTo: '/auth', pathMatch: 'full' }
];
