import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.user-dropdown-container');

    if (!dropdownContainer && this.showUserDropdown) {
      this.closeUserDropdown();
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
}
