import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  @Input() user!: User;
  @Input() currentPage: string = '';
  @Input() notifications: Notification[] = [];
  @Input() showNotifications: boolean = false;
  
  @Output() onNavigate = new EventEmitter<string>();
  @Output() onToggleNotifications = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();


  protected readonly title = signal('Navigation');
  
  searchQuery = '';
  mobileMenuOpen = false;

  constructor(private router: Router) {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get navItems() {
    const items = [
      { id: 'home', label: 'Home', icon: 'bi-house' },
      { id: 'editor', label: 'Write', icon: 'bi-pencil' }
    ];
    
    if (this.user.role === 'admin') {
      items.push({ id: 'admin', label: 'Admin', icon: 'bi-shield-check' });
    }
    
    return items;
  }

  navigateTo(page: string): void {
    this.onNavigate.emit(page);
    this.mobileMenuOpen = false;
  }

  toggleNotifications(): void {
    this.onToggleNotifications.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implement search functionality
      console.log('Search for:', this.searchQuery);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
