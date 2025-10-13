import { Routes } from '@angular/router';
import { Auth } from './auth/auth/auth.component';
import { Post } from './home/posts/Post/post.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: '' , component: Post , canActivate: [AuthGuard] },
  // { path: '', redirectTo: '/auth', pathMatch: 'full' }
];
