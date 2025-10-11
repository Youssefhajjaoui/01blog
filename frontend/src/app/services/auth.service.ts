import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  message: string;
  username?: string;
  role?: string;
}

export interface User {
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:9090/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.loadUserFromStorage();
  }

  /** ✅ Create headers (adds Authorization if token exists) */
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  /** ✅ Login and store token + user */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          const user: User = {
            username: response.username ?? '',
            email: '',
            role: response.role ?? 'USER'
          };
          this.setUser(user);
        }
      })
    );
  }

  /** ✅ Register */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerData, {
      headers: this.getHeaders()
    });
  }

  /** ✅ Logout */
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth']);
      }),
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/auth']);
        return of({ message: 'Logged out' });
      })
    );
  }

  /** ✅ SSR-safe token getter */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** ✅ Save token */
  private setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** ✅ Save user */
  private setUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /** ✅ Load user on startup */
  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.clearAuth();
      }
    }
  }

  /** ✅ Clear token + user */
  private clearAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /** ✅ Get current user */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** ✅ Check if admin */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  /** ✅ SSR-safe authentication check */
  isAuthenticated(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // Call backend to verify token
    return this.http.get(`${this.API_URL}/me`, { headers }).pipe(
      map(() => true), // Token is valid
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }

  /** ✅ Get username from email helper */
  getUsernameFromEmail(email: string): string {
    return email.split('@')[0];
  }
}
 