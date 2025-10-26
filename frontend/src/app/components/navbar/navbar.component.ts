import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  SearchSuggestionsService,
  SearchSuggestion,
} from '../../services/search-suggestions.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() currentPage: string = '';
  @Input() searchQuery: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() userClick = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<{ page: string }>();

  // ✨ Convert to signals
  showUserDropdown = signal(false);
  showSuggestions = signal(false);
  showNotificationPanel = signal(false);
  suggestions = signal<SearchSuggestion[]>([]);
  isLoadingSuggestions = signal(false);

  // Notification properties
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  constructor(
    private router: Router,
    private authService: AuthService,
    private searchSuggestionsService: SearchSuggestionsService,
    private notificationService: NotificationService
  ) {
    // Subscribe to search suggestions
    this.searchSuggestionsService.suggestions$.subscribe((suggestions) => {
      this.suggestions.set(suggestions);
      this.showSuggestions.set(suggestions.length > 0 && this.searchQuery.length >= 2);
      // ✨ No more detectChanges - signals auto-update!
    });

    this.searchSuggestionsService.isLoading$.subscribe((loading) => {
      this.isLoadingSuggestions.set(loading);
      // ✨ No more detectChanges!
    });
  }

  ngOnInit() {
    // Only load notifications if user is authenticated
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Load notifications from backend first
      this.notificationService.loadNotifications().subscribe();
      this.notificationService.loadUnreadCount().subscribe();

      // Subscribe to notifications
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications.set(notifications);
        // ✨ No more detectChanges!
      });

      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount.set(count);
        // ✨ No more detectChanges!
      });

      // Connect to SSE notifications for real-time updates
      this.notificationService.connectToNotifications();
    } else {
      // Clear notifications when user is not authenticated
      this.notifications.set([]);
      this.unreadCount.set(0);
      this.notificationService.disconnect();
    }
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.user-dropdown-container');
    const searchContainer = target.closest('.search-container');
    const notificationContainer = target.closest('.notification-container');

    if (!dropdownContainer && this.showUserDropdown()) {
      this.closeUserDropdown();
    }

    if (!searchContainer && this.showSuggestions()) {
      this.hideSuggestions();
    }

    if (!notificationContainer && this.showNotificationPanel()) {
      this.closeNotificationPanel();
    }
  }

  navigateToHome() {
    this.router.navigate(['/']);
    this.navigate.emit({ page: 'home' });
  }

  navigateToEditor() {
    this.router.navigate(['/create-post']);
    this.navigate.emit({ page: 'editor' });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
    this.navigate.emit({ page: 'admin' });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchChange.emit(this.searchQuery);

    // Trigger search suggestions
    if (this.searchQuery.length >= 2) {
      this.searchSuggestionsService.search(this.searchQuery);
      this.showSuggestions.set(true);
    } else {
      this.hideSuggestions();
    }

    // ✨ No more detectChanges - signals auto-update!
  }

  onNotificationClick() {
    this.showNotificationPanel.update((v) => !v);
    this.notificationClick.emit();
  }

  closeNotificationPanel() {
    this.showNotificationPanel.set(false);
  }

  toggleNotificationPanel() {
    this.showNotificationPanel.update((v) => !v);
  }

  markNotificationAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next(value) {},
      error(value) {
        console.error(value);
      },
    });
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next(value) {
        // unreadCount =
      },
      error(value) {
        console.error(value);
      },
    });
  }

  clearAllNotifications() {
    this.notificationService.clearAll().subscribe({
      next(value) {},
      error(value) {
        console.error(value);
      },
    });
  }

  formatNotificationDate(dateString: string): string {
    return this.notificationService.formatDate(dateString);
  }

  onUserClick() {
    this.userClick.emit();
  }

  toggleUserDropdown() {
    this.showUserDropdown.update((v) => !v);
  }

  closeUserDropdown() {
    this.showUserDropdown.set(false);
  }

  onProfileClick() {
    this.closeUserDropdown();
    // Navigate to profile page
    this.router.navigate(['/profile']);
    this.navigate.emit({ page: 'profile' });
  }

  onSignOutClick() {
    this.closeUserDropdown();
    // Handle sign out
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getAvatarUrl(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.avatar) {
      // If user has uploaded avatar, use the backend API endpoint
      const filename = currentUser.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'user'}`;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Search suggestions methods
  hideSuggestions() {
    this.showSuggestions.set(false);
    this.searchSuggestionsService.clearSuggestions();
  }

  onSuggestionClick(suggestion: SearchSuggestion, event?: Event) {
    // Prevent default behavior if event is provided
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.hideSuggestions();
    this.searchQuery = '';
    this.searchChange.emit('');

    if (suggestion.type === 'user') {
      // Navigate to user profile using Angular Router
      this.router
        .navigate(['/profile', suggestion.id.toString()])
        .then(() => {
          // ✨ No more detectChanges - signals auto-update!
        })
        .catch((error) => {
          console.error('Navigation error:', error);
        });
    }
  }

  onSearchInputFocus() {
    if (this.searchQuery.length >= 2 && this.suggestions().length > 0) {
      this.showSuggestions.set(true);
    }
  }

  onSearchInputBlur(event?: FocusEvent) {
    setTimeout(() => {
      // Only hide if user didn’t click inside suggestions
      const active = document.activeElement as HTMLElement;
      if (!active || !active.closest('.search-suggestions')) {
        this.hideSuggestions();
      }
    }, 150);
  }

  getUserAvatarUrl(user: any): string {
    if (user?.avatar) {
      const filename = user.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
  }
}
