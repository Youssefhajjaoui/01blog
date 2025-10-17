import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Navigation Bar -->
    <header class="navbar">
      <div class="nav-container">
        <div class="nav-content">
          <!-- Logo -->
          <button class="logo-btn" (click)="navigateToHome()">
            <div class="logo-icon">
              <span class="logo-text">01</span>
            </div>
            <span class="logo-name">Blog</span>
          </button>

          <!-- Desktop Navigation Links -->
          <div class="nav-links">
            <button class="nav-link" [class.active]="currentPage === 'home'" (click)="navigateToHome()">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button class="nav-link" [class.active]="currentPage === 'editor'" (click)="navigateToEditor()">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write
            </button>
          </div>

          <!-- Search Bar -->
          <div class="search-container">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="search" class="search-input" placeholder="Search posts, users, tags..."
              [(ngModel)]="searchQuery" (input)="onSearchChange($event)" />
          </div>

          <!-- Right Side Actions -->
          <div class="nav-actions">
            <!-- Notifications -->
            <button class="nav-action-btn" (click)="onNotificationClick()">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <!-- User Avatar -->
            <button class="user-avatar-btn" (click)="onUserClick()">
              <img [src]="getAvatarUrl()" [alt]="getCurrentUser()?.username || 'User'" class="nav-avatar" />
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() currentPage: string = '';
  @Input() searchQuery: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() userClick = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<{ page: string }>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  navigateToHome() {
    this.router.navigate(['/']);
    this.navigate.emit({ page: 'home' });
  }

  navigateToEditor() {
    this.router.navigate(['/create-post']);
    this.navigate.emit({ page: 'editor' });
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

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getAvatarUrl(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.image) {
      // If user has uploaded avatar, use the backend API endpoint
      const filename = currentUser.image.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'user'}`;
  }
}
