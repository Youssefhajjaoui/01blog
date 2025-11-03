import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: string;
  actionCallback?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) { }

  /**
   * Show a success message
   */
  success(message: string, config?: Partial<NotificationConfig>): void {
    this.show(message, { ...config, type: 'success' });
  }

  /**
   * Show an error message
   */
  error(message: string, config?: Partial<NotificationConfig>): void {
    this.show(message, { ...config, type: 'error', duration: 6000 });
  }

  /**
   * Show a warning message
   */
  warning(message: string, config?: Partial<NotificationConfig>): void {
    this.show(message, { ...config, type: 'warning' });
  }

  /**
   * Show an info message
   */
  info(message: string, config?: Partial<NotificationConfig>): void {
    this.show(message, { ...config, type: 'info' });
  }

  /**
   * Show a custom notification using Angular Material Snackbar
   */
  show(message: string, config: Partial<NotificationConfig> = {}): void {
    const finalConfig: NotificationConfig = {
      type: 'info',
      duration: 4000,
      ...config,
    };

    // Angular Material panel classes for styling
    const panelClass = this.getPanelClass(finalConfig.type!);

    const snackBarRef = this.snackBar.open(
      message,
      finalConfig.action,
      {
        duration: finalConfig.duration,
        panelClass: panelClass,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      }
    );

    // Handle action callback
    if (finalConfig.action && finalConfig.actionCallback) {
      snackBarRef.onAction().subscribe(() => {
        finalConfig.actionCallback!();
      });
    }
  }

  private getPanelClass(type: string): string[] {
    switch (type) {
      case 'success':
        return ['mat-snack-bar-success'];
      case 'error':
        return ['mat-snack-bar-error'];
      case 'warning':
        return ['mat-snack-bar-warning'];
      case 'info':
        return ['mat-snack-bar-info'];
      default:
        return ['mat-snack-bar-info'];
    }
  }

  /**
   * Dismiss a specific notification (not directly supported by Material, but kept for compatibility)
   */
  dismiss(notificationId: string): void {
    // Angular Material manages its own dismissals
    // This method is kept for backwards compatibility
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    // Angular Material manages its own dismissals
    // This method is kept for backwards compatibility
  }

  /**
   * Get all active notifications (not directly supported by Material)
   */
  getNotifications() {
    return [];
  }
}
