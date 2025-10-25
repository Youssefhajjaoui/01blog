import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(true);
    }
    return this.authService.checkAuth().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth']);
          return false;
        }

        const currentUser = this.authService.getCurrentUser();
        if (!this.authService.isAdmin()) {
          this.router.navigate(['/']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }
}
