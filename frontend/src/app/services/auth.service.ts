import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest } from '../models';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Use gateway hostname for SSR (Docker), localhost for browser
  private readonly API_URL: string;

  // ✨ Use signal instead of BehaviorSubject
  private currentUserSignal = signal<User | null>(null);
  private readonly platformId = inject(PLATFORM_ID);

  // Computed signals for derived state
  public currentUser = this.currentUserSignal.asReadonly(); // Read-only version
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor(private http: HttpClient, private userService: UserService) {
    // Use different API URL based on where code is running
    if (isPlatformServer(this.platformId)) {
      // Server-side (SSR in Docker): use gateway hostname
      this.API_URL = 'http://gateway:8080/api/auth';
    } else {
      // Client-side (browser): use localhost
      this.API_URL = 'http://localhost:8080/api/auth';
    }
  }

  /** Login - backend sets HttpOnly cookie automatically */
  login(loginData: LoginRequest): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/login`, loginData, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          // After successful login, fetch user data with statistics
          this.checkAuth().subscribe(() => {});
        }),
        catchError((error: any) => {
          // Extract error message from different possible formats
          let errorMessage = 'Login failed. Please try again.';

          // HttpClient error responses already contain full error details
          if (error.error) {
            // Handle JSON error response from backend
            if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          // Log the full error for debugging
          console.error('Login error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: errorMessage,
            url: error.url,
          });

          // Preserve the original error structure so components can access all details
          const customError: any = {
            ...error,
            error: error.error || { message: errorMessage },
            message: errorMessage,
          };

          return throwError(() => customError);
        })
      );
  }

  /** Register new user */
  register(registerData: RegisterRequest): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/register`, registerData, { withCredentials: true })
      .pipe(
        tap(() => {
          // After successful registration, fetch user data
          this.checkAuth().subscribe();
        })
      );
  }

  /** Logout - backend clears cookie */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        // Clear user data from both auth service and user service
        this.clearUserData();
      }),
      catchError((error) => {
        // Even if logout request fails, clear local user data
        this.clearUserData();
        return throwError(() => error);
      })
    );
  }

  /** Clear user data from all services */
  private clearUserData(): void {
    this.currentUserSignal.set(null);
    this.userService.clearUser();
  }

  /** Check authentication by requesting /me */
  checkAuth(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      // During SSR/prerender, return true to avoid redirects
      // The actual auth check will happen on client-side hydration
      return of(true);
    }
    return this.http.get<User>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap((user) => this.currentUserSignal.set(user)),
      map(() => true),
      catchError(() => {
        this.currentUserSignal.set(null);
        return of(false);
      })
    );
  }

  /** Get current user value (for backwards compatibility) */
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }
}
