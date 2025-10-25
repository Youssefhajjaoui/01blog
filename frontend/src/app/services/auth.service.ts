import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest } from '../models';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:9090/api/auth';

  // ✨ Use signal instead of BehaviorSubject
  private currentUserSignal = signal<User | null>(null);
  private readonly platformId = inject(PLATFORM_ID);

  // Computed signals for derived state
  public currentUser = this.currentUserSignal.asReadonly(); // Read-only version
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor(private http: HttpClient) { }

  /** Login - backend sets HttpOnly cookie automatically */
  login(loginData: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, loginData, { withCredentials: true }).pipe(
      tap(() => {
        // After successful login, fetch user data with statistics
        this.checkAuth().subscribe();
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
    return this.http
      .post<void>(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUserSignal.set(null)));
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
