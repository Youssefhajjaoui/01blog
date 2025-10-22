import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  SearchSuggestionsService,
  SearchSuggestion,
} from '../../services/search-suggestions.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Input() currentPage: string = '';
  @Input() searchQuery: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() userClick = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<{ page: string }>();

  showUserDropdown = false;
  showSuggestions = false;
  suggestions: SearchSuggestion[] = [];
  isLoadingSuggestions = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private searchSuggestionsService: SearchSuggestionsService
  ) {
    // Subscribe to search suggestions
    this.searchSuggestionsService.suggestions$.subscribe((suggestions) => {
      this.suggestions = suggestions;
      this.showSuggestions = suggestions.length > 0 && this.searchQuery.length >= 2;
    });

    this.searchSuggestionsService.isLoading$.subscribe((loading) => {
      this.isLoadingSuggestions = loading;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.user-dropdown-container');
    const searchContainer = target.closest('.search-container');

    if (!dropdownContainer && this.showUserDropdown) {
      this.closeUserDropdown();
    }

    if (!searchContainer && this.showSuggestions) {
      this.hideSuggestions();
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
      this.showSuggestions = true;
    } else {
      this.hideSuggestions();
    }
  }

  onNotificationClick() {
    this.notificationClick.emit();
  }

  onUserClick() {
    this.userClick.emit();
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown() {
    this.showUserDropdown = false;
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
    this.showSuggestions = false;
    this.searchSuggestionsService.clearSuggestions();
  }

  onSuggestionClick(suggestion: SearchSuggestion) {
    this.hideSuggestions();
    this.searchQuery = '';
    this.searchChange.emit('');

    if (suggestion.type === 'user') {
      // Navigate to user profile
      this.router.navigate(['/profile', suggestion.id.toString()]);
    }
  }

  onSearchInputFocus() {
    if (this.searchQuery.length >= 2 && this.suggestions.length > 0) {
      this.showSuggestions = true;
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
