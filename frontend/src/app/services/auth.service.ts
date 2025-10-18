import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  followers: number;
  following: number;
  posts: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:9090/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Login - backend sets HttpOnly cookie automatically */
  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(() => {
          // After successful login, fetch user data with statistics
          this.checkAuth().subscribe();
        })
      );
  }

  /** Logout - backend clears cookie */
  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUserSubject.next(null)));
  }

  /** Check authentication by requesting /me */
  checkAuth(): Observable<boolean> {
    return this.http.get<User>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      map(() => true),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  /** Current user observable */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }
}
