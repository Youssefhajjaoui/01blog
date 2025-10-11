import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // Only check token in the browser
    if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
      return true;
    } else if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/auth']);
      return false;
    }
    // On SSR, allow navigation (or handle differently)
    return true;
  }
}
