import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, UserLoginDto, UserRegistrationDto, AuthResponseDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:9090/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token on service initialization
    this.loadUserFromStorage();
  }

  login(credentials: UserLoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setCurrentUser(response.user, response.token);
        })
      );
  }

  register(userData: UserRegistrationDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          this.setCurrentUser(response.user, response.token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setCurrentUser(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.logout();
      }
    }
  }

  // Mock login for development
  mockLogin(email: string, password: string): Observable<AuthResponseDto> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: email === 'admin@01blog.com' ? 'Admin User' : 'Sarah Chen',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
          bio: 'Computer Science student sharing my coding journey and learning experiences.',
          role: email === 'admin@01blog.com' ? 'admin' : 'user',
          subscribers: 1234,
          posts: 42
        };

        const mockResponse: AuthResponseDto = {
          token: 'mock-jwt-token',
          user: mockUser,
          expiresIn: 3600
        };

        this.setCurrentUser(mockUser, mockResponse.token);
        observer.next(mockResponse);
        observer.complete();
      }, 1000);
    });
  }

  // Mock registration for development
  mockRegister(userData: UserRegistrationDto): Observable<AuthResponseDto> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockUser: User = {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          bio: 'New to 01Blog! Excited to share my learning journey.',
          role: 'user',
          subscribers: 0,
          posts: 0
        };

        const mockResponse: AuthResponseDto = {
          token: 'mock-jwt-token',
          user: mockUser,
          expiresIn: 3600
        };

        this.setCurrentUser(mockUser, mockResponse.token);
        observer.next(mockResponse);
        observer.complete();
      }, 1500);
    });
  }
}
