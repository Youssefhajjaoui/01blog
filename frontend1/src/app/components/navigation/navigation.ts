import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
export class NavigationComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() currentPage: string = '';
  @Input() notifications: Notification[] = [];
  @Input() showNotifications: boolean = false;
  
  @Output() navigate = new EventEmitter<string>();
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  searchQuery = '';
  mobileMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get navItems() {
    const items = [
      { id: 'home', label: 'Home', icon: 'bi-house' },
      { id: 'editor', label: 'Write', icon: 'bi-pencil' }
    ];

    if (this.user?.role === 'admin') {
      items.push({ id: 'admin', label: 'Admin', icon: 'bi-shield' });
    }

    return items;
  }

  onNavigate(page: string): void {
    this.navigate.emit(page);
    this.mobileMenuOpen = false;
  }

  navigateTo(page: string): void {
    this.navigate.emit(page);
    this.mobileMenuOpen = false;
  }

  onToggleNotifications(): void {
    this.toggleNotifications.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}