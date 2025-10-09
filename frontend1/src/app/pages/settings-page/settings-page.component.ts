import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss'
})
export class SettingsPageComponent implements OnInit {
  protected readonly title = signal('Settings');
  
  user: User = {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'Computer Science student sharing my coding journey and learning experiences.',
    role: 'user',
    subscribers: 1234,
    posts: 42
  };

  settings = {
    notifications: {
      email: true,
      push: true,
      likes: true,
      comments: true,
      follows: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      allowMessages: true
    },
    appearance: {
      theme: 'light',
      language: 'en'
    }
  };

  activeTab = 'profile';
  loading = false;
  saving = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  saveProfile(): void {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      alert('Profile updated successfully!');
    }, 1000);
  }

  saveSettings(): void {
    this.saving = true;
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(this.settings));
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      alert('Settings saved successfully!');
    }, 1000);
  }

  changePassword(): void {
    // Open change password modal or navigate to change password page
    alert('Change password functionality would be implemented here');
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion functionality would be implemented here');
    }
  }

  exportData(): void {
    alert('Data export functionality would be implemented here');
  }

  toggleTheme(): void {
    this.settings.appearance.theme = this.settings.appearance.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', this.settings.appearance.theme);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
