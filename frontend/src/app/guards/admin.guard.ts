import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
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
