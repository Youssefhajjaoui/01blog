import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { isPlatformServer } from '@angular/common';
import {
  User,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserStats,
  UserSuggestion,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL: string;
  private readonly STORAGE_KEY = 'currentUser';
  private readonly platformId = inject(PLATFORM_ID);

  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient, private storageService: StorageService) {
    // Use different API URL based on where code is running
    this.API_URL = isPlatformServer(this.platformId)
      ? 'http://gateway:8080/api'  // Server-side (SSR in Docker)
      : 'http://localhost:8080/api'; // Client-side (browser)

    // Automatically fetch user from server on service initialization
    // This ensures the user data is available immediately when any component injects this service
    this.initializeUser();
  }

  /**
   * Initialize user by fetching from /api/auth/me endpoint
   * This method is called automatically when the service is first instantiated
   */
  private initializeUser(): void {
    // Automatically check authentication status from server
    // The result will be stored in currentUserSubject for all components to access
    this.checkAuthStatus().subscribe({
      next: (user) => {
        if (user) {
          console.log('User authenticated:', user.username);
        } else {
          console.log('User not authenticated');
        }
      },
      error: (error) => {
        console.log('Authentication check failed:', error.message);
      },
    });
  }

  /**
   * Check authentication status by calling /api/auth/me
   */
  private checkAuthStatus(): Observable<User | null> {
    return this.http.get<User>(`${this.API_URL}/auth/me`, { withCredentials: true }).pipe(
      tap((user) => {
        // Store user data both in memory and localStorage for persistence
        this.currentUserSubject.next(user);
        this.storageService.setItem(this.STORAGE_KEY, JSON.stringify(user));
      }),
      catchError((error) => {
        // If authentication fails, clear any stored data
        this.currentUserSubject.next(null);
        this.storageService.removeItem(this.STORAGE_KEY);
        return of(null);
      })
    );
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  /**
   * Check if current user is the owner of a resource
   */
  isOwner(userId: number): boolean {
    return this.currentUserSubject.value?.id === userId;
  }

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: number): Observable<UserProfile> {
    this.loadingSubject.next(true);
    return this.http
      .get<UserProfile>(`${this.API_URL}/users/${userId}`, { withCredentials: true })
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error) => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user profile with latest data from server
   */
  getCurrentUserProfile(): Observable<User | null> {
    this.loadingSubject.next(true);
    return this.checkAuthStatus().pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError((error) => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update current user profile
   */
  updateProfile(updateData: UpdateProfileRequest): Observable<User> {
    this.loadingSubject.next(true);
    return this.http
      .put<User>(`${this.API_URL}/users/profile`, updateData, { withCredentials: true })
      .pipe(
        tap((updatedUser) => {
          this.currentUserSubject.next(updatedUser);
          this.storageService.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
          this.loadingSubject.next(false);
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Change user password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    this.loadingSubject.next(true);
    return this.http
      .put(`${this.API_URL}/users/change-password`, passwordData, { withCredentials: true })
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError((error) => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Upload avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    this.loadingSubject.next(true);
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http
      .post<{ avatarUrl: string }>(`${this.API_URL}/users/upload-avatar`, formData, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          // Update current user with new avatar
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.avatar = response.avatarUrl;
            this.currentUserSubject.next(currentUser);
            this.storageService.setItem(this.STORAGE_KEY, JSON.stringify(currentUser));
          }
          this.loadingSubject.next(false);
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Follow a user
   */
  followUser(userId: number): Observable<any> {
    console.warn(userId);
    return this.http
      .post(`${this.API_URL}/subscriptions/follow/${userId}`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Refresh current user data to update following count
          this.getCurrentUserProfile().subscribe();
        })
      );
  }

  /**
   * Unfollow a user
   */
  unfollowUser(userId: number): Observable<any> {
    console.warn(userId);
    return this.http
      .delete(`${this.API_URL}/subscriptions/unfollow/${userId}`, { withCredentials: true })
      .pipe(
        tap(() => {
          // Refresh current user data to update following count
          this.getCurrentUserProfile().subscribe();
        })
      );
  }

  /**
   * Check if current user is following another user
   */
  isFollowing(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/subscriptions/is-following/${userId}`, {
      withCredentials: true,
    });
  }

  /**
   * Get user's followers
   */
  getUserFollowers(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users/${userId}/followers`);
  }

  /**
   * Get users that a user is following
   */
  getUserFollowing(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users/${userId}/following`);
  }

  /**
   * Search users by username
   */
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/suggestions/search`, {
      params: { q: query },
      withCredentials: true,
    });
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/users/${userId}/stats`);
  }

  /**
   * Clear user data (logout)
   */
  clearUser(): void {
    this.currentUserSubject.next(null);
    this.storageService.removeItem(this.STORAGE_KEY);
  }

  /**
   * Manually trigger authentication check
   * Useful for components that need to refresh user data
   */
  checkAuthentication(): Observable<User | null> {
    return this.checkAuthStatus();
  }

  /**
   * Refresh user data
   */
  refreshUser(): Observable<User | null> {
    return this.checkAuthStatus();
  }

  /**
   * Get loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get loading state as observable
   */
  getLoadingObservable(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Check if user can edit a resource
   */
  canEdit(userId: number): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser !== null && (this.isAdmin() || this.isOwner(userId));
  }

  /**
   * Check if user can delete a resource
   */
  canDelete(userId: number): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser !== null && (this.isAdmin() || this.isOwner(userId));
  }

  /**
   * Get user display name (fallback to username if no display name)
   */
  getUserDisplayName(user: User): string {
    return user.username;
  }

  /**
   * Get user avatar URL with fallback
   */
  getUserAvatar(user: User): string {
    return user.avatar || '/assets/default-avatar.png';
  }

  /**
   * Report a user
   */
  reportUser(userId: number, reportData: { reason: string; details: string }): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/reports`,
      {
        reportedUser: { id: userId },
        reason: reportData.reason,
        description: reportData.details,
      },
      { withCredentials: true }
    );
  }
}
