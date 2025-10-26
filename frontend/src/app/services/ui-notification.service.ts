import { Injectable } from '@angular/core';

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
  private notifications: Array<{
    id: string;
    message: string;
    config: NotificationConfig;
    timestamp: number;
  }> = [];

  private notificationContainer: HTMLElement | null = null;

  constructor() {
    this.createNotificationContainer();
  }

  private createNotificationContainer(): void {
    if (typeof document === 'undefined') return; // SSR check

    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.notificationContainer);
  }

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
   * Show a custom notification
   */
  show(message: string, config: Partial<NotificationConfig> = {}): void {
    if (typeof document === 'undefined') return; // SSR check

    const finalConfig: NotificationConfig = {
      type: 'info',
      duration: 4000,
      ...config,
    };

    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: notificationId,
      message,
      config: finalConfig,
      timestamp: Date.now(),
    };

    this.notifications.push(notification);
    this.renderNotification(notification);

    // Auto-dismiss after duration
    if (finalConfig.duration && finalConfig.duration > 0) {
      setTimeout(() => {
        this.dismiss(notificationId);
      }, finalConfig.duration);
    }
  }

  private renderNotification(notification: {
    id: string;
    message: string;
    config: NotificationConfig;
  }): void {
    if (!this.notificationContainer) return;

    const notificationElement = document.createElement('div');
    notificationElement.id = notification.id;
    notificationElement.style.cssText = `
      background: ${this.getBackgroundColor(notification.config.type!)};
      color: white;
      padding: 16px 20px;
      margin-bottom: 12px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.5;
      min-width: 300px;
      max-width: 500px;
      position: relative;
      overflow: hidden;
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      opacity: 0;
    `;

    // Add colored top border
    const topBorder = document.createElement('div');
    topBorder.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${this.getBorderColor(notification.config.type!)};
    `;
    notificationElement.appendChild(topBorder);

    // Add message content
    const messageElement = document.createElement('div');
    messageElement.textContent = notification.message;
    messageElement.style.cssText = `
      padding-top: 4px;
    `;
    notificationElement.appendChild(messageElement);

    // Add action button if provided
    if (notification.config.action) {
      const actionButton = document.createElement('button');
      actionButton.textContent = notification.config.action;
      actionButton.style.cssText = `
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        cursor: pointer;
        margin-left: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
      `;

      actionButton.addEventListener('mouseenter', () => {
        actionButton.style.color = 'white';
        actionButton.style.background = 'rgba(255, 255, 255, 0.1)';
      });

      actionButton.addEventListener('mouseleave', () => {
        actionButton.style.color = 'rgba(255, 255, 255, 0.9)';
        actionButton.style.background = 'none';
      });

      if (notification.config.actionCallback) {
        actionButton.addEventListener('click', notification.config.actionCallback);
      }

      notificationElement.appendChild(actionButton);
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      font-size: 18px;
      line-height: 1;
      transition: opacity 0.2s ease;
    `;

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.opacity = '1';
      closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.opacity = '0.7';
      closeButton.style.background = 'none';
    });

    closeButton.addEventListener('click', () => {
      this.dismiss(notification.id);
    });

    notificationElement.appendChild(closeButton);

    this.notificationContainer.appendChild(notificationElement);

    // Trigger animation
    requestAnimationFrame(() => {
      notificationElement.style.transform = 'translateX(0)';
      notificationElement.style.opacity = '1';
    });
  }

  private getBackgroundColor(type: string): string {
    switch (type) {
      case 'success':
        return ' #5C7E8F';
      case 'error':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)';
      case 'warning':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)';
      case 'info':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)';
    }
  }

  private getBorderColor(type: string): string {
    switch (type) {
      case 'success':
        return ' #5C7E8F';
      case 'error':
        return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
      case 'info':
        return 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
      default:
        return 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
    }
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(notificationId: string): void {
    const element = document.getElementById(notificationId);
    if (element) {
      element.style.transform = 'translateX(100%)';
      element.style.opacity = '0';

      setTimeout(() => {
        element.remove();
        this.notifications = this.notifications.filter((n) => n.id !== notificationId);
      }, 300);
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications.forEach((notification) => {
      this.dismiss(notification.id);
    });
  }

  /**
   * Get all active notifications
   */
  getNotifications() {
    return [...this.notifications];
  }
}
