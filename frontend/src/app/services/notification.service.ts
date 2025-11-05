import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface Notification {
  id: number;
  message: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'SYSTEM' | 'POST';
  isRead: boolean;
  createdAt: string;
  creatorName?: string;
  relatedUserId?: number;
  relatedPostId?: number;
  relatedCommentId?: number;
}

export interface NotificationDto {
  id: number;
  creatorName: string;
  title: string;
  creationDate: string;
  content: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL: string;
  private readonly BASE_URL: string;
  private eventSource: EventSource | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  // Configuration
  private enableSSE = true; // Backend SSE endpoint is implemented at /api/sse/notifications

  // State management
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Use gateway for SSR in Docker, localhost for browser
    const baseUrl = isPlatformBrowser(this.platformId)
      ? 'http://localhost:8080'
      : 'http://gateway:8080';
    this.BASE_URL = baseUrl;
    this.API_URL = `${baseUrl}/api`;
  }

  /**
   * Load notifications from backend
   */
  loadNotifications(): Observable<Notification[]> {
    // Skip API calls during SSR
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Notification loading skipped - not in browser environment (SSR)');
      return of([]);
    }

    return this.http
      .get<NotificationDto[]>(`${this.API_URL}/notifications`, { withCredentials: true })
      .pipe(
        map((notifications) => notifications.map(this.mapNotificationDto)),
        tap((notifications) => {
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        }),
        catchError((error) => {
          'Failed to load notifications:', error;
          // Return empty array on error (e.g., user not authenticated)
          return of([]);
        })
      );
  }

  /**
   * Load unread count from backend
   */
  loadUnreadCount(): Observable<number> {
    // Skip API calls during SSR
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Unread count loading skipped - not in browser environment (SSR)');
      return of(0);
    }

    return this.http
      .get<{ count: number }>(`${this.API_URL}/notifications/unread-count`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.count),
        tap((count) => this.unreadCountSubject.next(count)),
        catchError((error) => {
          'Failed to load unread count:', error;
          // Return 0 on error (e.g., user not authenticated)
          return of(0);
        })
      );
  }

  /**
   * Connect to Server-Sent Events for real-time notifications
   */
  connectToNotifications(): void {
    // Only attempt SSE connection in browser environment (not during SSR)
    if (!isPlatformBrowser(this.platformId)) {
      console.log('SSE connection skipped - not in browser environment (SSR)');
      return;
    }

    if (!this.enableSSE) {
      console.log('SSE notifications disabled - backend endpoint not implemented yet');
      return;
    }

    if (typeof EventSource === 'undefined') {
      ('EventSource not supported in this environment');
      return;
    }

    this.disconnect(); // Disconnect any existing connection

    try {
      this.eventSource = new EventSource(`${this.API_URL}/sse/notifications`, {
        withCredentials: true,
      });

      this.eventSource.onopen = () => {
        console.log('✅ SSE connection established successfully');
      };

      // Listen for the "connected" event
      this.eventSource.addEventListener('connected', (event: any) => {
        console.log('✅ SSE stream connected:', event.data);
      });

      // Listen for the "notification" event (backend sends with .name("notification"))
      this.eventSource.addEventListener('notification', (event: any) => {
        try {
          const notification: NotificationDto = JSON.parse(event.data);
          const mappedNotification = this.mapNotificationDto(notification);

          console.log('🔔 New notification received:', notification);

          // Add to current notifications
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([mappedNotification, ...currentNotifications]);

          // Update unread count
          this.updateUnreadCount();
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        // The connection will automatically attempt to reconnect
        // If you want to prevent reconnection, call this.disconnect()
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }

  /**
   * Disconnect from SSE
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http
      .put<void>(
        `${this.API_URL}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updatedNotifications = notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }),
        catchError((error) => {
          'Failed to mark notification as read:', error;
          return of(void 0);
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http
      .put<void>(`${this.API_URL}/notifications/mark-all-read`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }),
        catchError((error) => {
          console.warn('Failed to mark all notifications as read:', error);
          return of(void 0);
        })
      );
  }

  /**
   * Clear all notifications
   */
  clearAll(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/notifications`, { withCredentials: true }).pipe(
      tap(() => {
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }),
      catchError((error) => {
        console.warn('Failed to clear notifications:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Get current notifications
   */
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) {
      return 'Unknown date';
    }

    try {
      // Handle various date formats from backend
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return 'Invalid date';
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // Handle future dates (shouldn't happen but just in case)
      if (diffInSeconds < 0) {
        return 'Just now';
      }

      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      } else {
        // Format as readable date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  }

  /**
   * Map notification DTO to internal notification model
   */
  private mapNotificationDto(dto: NotificationDto): Notification {
    // Log the notification for debugging
    console.log('📦 Notification from backend:', dto);

    return {
      id: dto.id,
      message: dto.content || dto.title, // Use content as message, fallback to title
      type: 'POST', // Default type, can be enhanced based on content
      isRead: dto.read, // Backend uses 'read', frontend uses 'isRead' (same meaning)
      createdAt: dto.creationDate, // Backend uses 'creationDate', frontend uses 'createdAt'
      creatorName: dto.creatorName,
    };
  }

  /**
   * Update unread count based on current notifications
   */
  private updateUnreadCount(): void {
    const notifications = this.notificationsSubject.value;
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
