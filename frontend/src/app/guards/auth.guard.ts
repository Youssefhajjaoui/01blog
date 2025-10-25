import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    // During SSR, allow navigation to avoid redirects
    // The actual auth check will happen on client-side hydration
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }

    return this.authService.checkAuth().pipe(
      tap((isAuth) => {
        console.warn('AuthGuard - isAuth:', isAuth);
        if (!isAuth) {
          console.warn('AuthGuard - User not authenticated, redirecting to /auth');
          this.router.navigate(['/auth']);
        }
      }),
      catchError((error) => {
        console.warn('AuthGuard - Error checking auth:', error);
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }
}
