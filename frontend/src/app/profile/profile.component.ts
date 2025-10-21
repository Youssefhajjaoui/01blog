import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { User, Post } from '../models';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  userPosts: Post[] = [];
  activeTab: 'posts' | 'about' | 'media' = 'posts';
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';

  // Mock media items for the media tab
  mediaItems = [
    'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHx8MTc1ODc5NzI2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ];

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserPosts();
  }

  loadUserPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        // Filter posts by current user
        this.userPosts = posts.filter((post) => post.author.id === this.currentUser?.id);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      },
    });
  }

  getAvatarUrl(): string {
    if (this.currentUser?.avatar) {
      const filename = this.currentUser.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${
      this.currentUser?.username || 'user'
    }`;
  }

  setActiveTab(tab: 'posts' | 'about' | 'media') {
    this.activeTab = tab;
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  navigateToSettings() {
    // TODO: Implement settings navigation
    console.log('Navigate to settings');
  }

  navigateToEditor() {
    this.router.navigate(['/create-post']);
  }

  viewPost(post: Post) {
    // TODO: Implement post viewing
    console.log('View post:', post);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    // Implement search functionality
  }

  onNotificationClick() {
    // Implement notification functionality
    console.log('Notification clicked');
  }

  onNavigate(page: string) {
    if (page === 'editor') {
      this.router.navigate(['/create-post']);
    } else if (page === 'home') {
      this.router.navigate(['/']);
    } else if (page === 'profile') {
      // Already on profile page
    }
  }

  onUserClick() {
    // Implement user menu functionality
    console.log('User clicked');
  }
}
