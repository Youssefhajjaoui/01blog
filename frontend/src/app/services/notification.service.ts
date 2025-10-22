import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

export interface Notification {
    id: number;
    creatorName: string;
    title: string;
    content: string;
    creationDate: string;
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly API_URL = 'http://localhost:9090';

    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    private eventSource: EventSource | null = null;

    constructor(private http: HttpClient) { }

    /**
     * Load notifications from backend
     */
    loadNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.API_URL}/api/notifications`, {
            withCredentials: true
        }).pipe(
            tap(notifications => {
                this.notificationsSubject.next(notifications);
                this.updateUnreadCount();
            }),
            catchError(error => {
                console.error('Error loading notifications:', error);
                return of([]);
            })
        );
    }

    /**
     * Get unread count from backend
     */
    loadUnreadCount(): Observable<number> {
        return this.http.get<{ unreadCount: number }>(`${this.API_URL}/api/notifications/unread-count`, {
            withCredentials: true
        }).pipe(
            tap(response => {
                this.unreadCountSubject.next(response.unreadCount);
            }),
            map(response => response.unreadCount),
            catchError(error => {
                console.error('Error loading unread count:', error);
                return of(0);
            })
        );
    }

    /**
     * Connect to SSE notifications stream
     */
    connectToNotifications(): EventSource {
        if (this.eventSource) {
            this.eventSource.close();
        }

        this.eventSource = new EventSource(`${this.API_URL}/api/sse/notifications`, {
            withCredentials: true
        });

        this.eventSource.addEventListener('notification', (event) => {
            try {
                const notificationData = JSON.parse(event.data);
                this.addNotification(notificationData);
            } catch (error) {
                console.error('Error parsing notification:', error);
            }
        });

        this.eventSource.addEventListener('connected', (event) => {
            console.log('SSE connected:', event.data);
            // Reload notifications when SSE connects to ensure we have latest data
            this.loadNotifications().subscribe();
        });

        this.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
        };

        return this.eventSource;
    }

    /**
     * Disconnect from SSE stream
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /**
     * Add a new notification
     */
    private addNotification(notificationData: any): void {
        const notification: Notification = {
            id: Date.now(), // Temporary ID for frontend
            creatorName: notificationData.creatorName || 'Unknown',
            title: notificationData.title || 'New Notification',
            content: notificationData.content || notificationData.Content || '',
            creationDate: notificationData.creationDate || new Date().toISOString(),
            read: false
        };

        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = [notification, ...currentNotifications];
        this.notificationsSubject.next(updatedNotifications);

        // Update unread count
        this.updateUnreadCount();
    }

    /**
     * Get all notifications
     */
    getNotifications(): Observable<Notification[]> {
        return this.notifications$;
    }

    /**
     * Get unread count
     */
    getUnreadCount(): Observable<number> {
        return this.unreadCount$;
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId: number): void {
        // Optimistic UI update
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(notification =>
            notification.id === notificationId
                ? { ...notification, read: true }
                : notification
        );
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();

        // Update backend
        this.http.put(`${this.API_URL}/api/notifications/${notificationId}/read`, {}, {
            withCredentials: true
        }).subscribe({
            next: () => {
                console.log('Notification marked as read');
            },
            error: (error) => {
                console.error('Error marking notification as read:', error);
                // Revert optimistic update on error
                const revertedNotifications = notifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: false }
                        : notification
                );
                this.notificationsSubject.next(revertedNotifications);
                this.updateUnreadCount();
            }
        });
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        // Optimistic UI update
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(notification =>
            ({ ...notification, read: true })
        );
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();

        // Update backend
        this.http.put(`${this.API_URL}/api/notifications/mark-all-read`, {}, {
            withCredentials: true
        }).subscribe({
            next: () => {
                console.log('All notifications marked as read');
            },
            error: (error) => {
                console.error('Error marking all notifications as read:', error);
                // Revert optimistic update on error
                this.notificationsSubject.next(notifications);
                this.updateUnreadCount();
            }
        });
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        // Update backend first
        this.http.delete(`${this.API_URL}/api/notifications`, {
            withCredentials: true
        }).subscribe({
            next: () => {
                this.notificationsSubject.next([]);
                this.unreadCountSubject.next(0);
                console.log('All notifications cleared');
            },
            error: (error) => {
                console.error('Error clearing notifications:', error);
            }
        });
    }

    /**
     * Update unread count
     */
    private updateUnreadCount(): void {
        const notifications = this.notificationsSubject.value;
        const unreadCount = notifications.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
    }

    /**
     * Format notification date
     */
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}
