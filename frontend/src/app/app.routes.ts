import { Routes } from '@angular/router';
import { Auth } from './auth/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { HomePageComponent } from './home/home.component';
import { PostCreate } from './components/post-create/post-create';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: 'create-post', component: PostCreate, canActivate: [AuthGuard] },
  { path: '', component: HomePageComponent, canActivate: [AuthGuard] },
  // { path: '', redirectTo: '/auth', pathMatch: 'full' }
];
