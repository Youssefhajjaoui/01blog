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
  template: `
    <!-- Navigation Bar -->
    <app-navbar
      [currentPage]="'profile'"
      [searchQuery]="searchQuery"
      (searchChange)="onSearchChange($event)"
      (notificationClick)="onNotificationClick()"
      (navigate)="onNavigate($event.page)"
      (userClick)="onUserClick()"
    >
    </app-navbar>

    <div class="profile-container">
      <!-- Profile Header Card -->
      <div class="profile-header">
        <div class="profile-content">
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="profile-avatar">
              <img
                [src]="getAvatarUrl()"
                [alt]="currentUser?.username || 'User'"
                class="avatar-image"
              />
            </div>

            <!-- Mobile Stats -->
            <div class="mobile-stats">
              <div class="stat-item">
                <div class="stat-number">{{ currentUser?.posts || 0 }}</div>
                <div class="stat-label">Posts</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ currentUser?.followers || 0 }}</div>
                <div class="stat-label">Followers</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ currentUser?.following || 0 }}</div>
                <div class="stat-label">Following</div>
              </div>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="profile-details">
            <div class="profile-header-row">
              <div class="profile-info">
                <h1 class="profile-name">{{ currentUser?.username || 'User' }}</h1>
                <p class="profile-email">{{ currentUser?.email || 'user@example.com' }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="profile-actions">
                <button class="edit-profile-btn" (click)="navigateToSettings()">
                  <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>

            <!-- Desktop Stats -->
            <div class="desktop-stats">
              <div class="stat-item">
                <span class="stat-number">{{ currentUser?.posts || 0 }}</span>
                <span class="stat-label">Posts</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ currentUser?.followers || 0 }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ currentUser?.following || 0 }}</span>
                <span class="stat-label">Following</span>
              </div>
            </div>

            <!-- Bio -->
            <div class="profile-bio" *ngIf="currentUser?.bio">
              <p>{{ currentUser?.bio }}</p>
            </div>

            <!-- Additional Info -->
            <div class="profile-info-details">
              <div class="info-item">
                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                San Francisco, CA
              </div>
              <div class="info-item">
                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Joined January 2024
              </div>
              <div class="info-item">
                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <a href="#" class="profile-link">portfolio.sarahchen.dev</a>
              </div>
            </div>

            <!-- Skills/Interests -->
            <div class="skills-section">
              <div class="skill-tag">React</div>
              <div class="skill-tag">JavaScript</div>
              <div class="skill-tag">Python</div>
              <div class="skill-tag">Machine Learning</div>
              <div class="skill-tag">Web Development</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Navigation Tabs -->
      <div class="content-tabs">
        <div class="tabs-header">
          <div class="tabs-list">
            <button class="tab-button active" (click)="setActiveTab('posts')">Posts</button>
            <button class="tab-button" (click)="setActiveTab('about')">About</button>
            <button class="tab-button" (click)="setActiveTab('media')">Media</button>
          </div>

          <!-- View Mode Toggle -->
          <div class="view-toggle" *ngIf="activeTab === 'posts'">
            <button
              class="view-btn"
              [class.active]="viewMode === 'grid'"
              (click)="setViewMode('grid')"
            >
              <svg class="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              class="view-btn"
              [class.active]="viewMode === 'list'"
              (click)="setViewMode('list')"
            >
              <svg class="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Posts Tab Content -->
        <div class="tab-content" *ngIf="activeTab === 'posts'">
          <div *ngIf="userPosts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3>No posts yet</h3>
            <p>Start sharing your learning journey!</p>
            <button class="create-post-btn" (click)="navigateToEditor()">
              Write Your First Post
            </button>
          </div>

          <div
            *ngIf="userPosts.length > 0"
            [class]="'posts-container ' + (viewMode === 'grid' ? 'grid-view' : 'list-view')"
          >
            <div *ngFor="let post of userPosts" class="post-card" (click)="viewPost(post)">
              <div class="post-image" *ngIf="post.media && post.media.length > 0">
                <img [src]="post.media[0].url" [alt]="post.media[0].alt" />
              </div>
              <div class="post-content">
                <div class="post-author">
                  <img [src]="getAvatarUrl()" [alt]="post.author.username" class="author-avatar" />
                  <span class="author-name">{{ post.author.username }}</span>
                </div>
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.excerpt }}</p>
                <div class="post-engagement">
                  <div class="engagement-item">
                    <svg
                      class="engagement-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{{ post.likes }}</span>
                  </div>
                  <div class="engagement-item">
                    <svg
                      class="engagement-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{{ post.comments }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- About Tab Content -->
        <div class="tab-content" *ngIf="activeTab === 'about'">
          <div class="about-grid">
            <div class="about-card">
              <h3>Education</h3>
              <div class="about-item">
                <div class="about-title">Bachelor of Science in Computer Science</div>
                <div class="about-subtitle">University of California, Berkeley</div>
                <div class="about-date">2022 - 2026</div>
              </div>
            </div>

            <div class="about-card">
              <h3>Experience</h3>
              <div class="about-item">
                <div class="about-title">Software Engineering Intern</div>
                <div class="about-subtitle">TechCorp Inc.</div>
                <div class="about-date">Summer 2024</div>
              </div>
              <div class="about-item">
                <div class="about-title">Frontend Developer</div>
                <div class="about-subtitle">Student Startup</div>
                <div class="about-date">2023 - Present</div>
              </div>
            </div>

            <div class="about-card">
              <h3>Projects</h3>
              <div class="about-item">
                <div class="about-title">E-commerce Platform</div>
                <div class="about-subtitle">
                  Full-stack web application built with React and Node.js
                </div>
                <div class="project-tags">
                  <span class="project-tag">React</span>
                  <span class="project-tag">Node.js</span>
                  <span class="project-tag">MongoDB</span>
                </div>
              </div>
              <div class="about-item">
                <div class="about-title">Machine Learning Model</div>
                <div class="about-subtitle">Image classification model using TensorFlow</div>
                <div class="project-tags">
                  <span class="project-tag">Python</span>
                  <span class="project-tag">TensorFlow</span>
                  <span class="project-tag">Computer Vision</span>
                </div>
              </div>
            </div>

            <div class="about-card">
              <h3>Achievements</h3>
              <div class="about-item">
                <div class="about-title">Dean's List</div>
                <div class="about-subtitle">Fall 2023, Spring 2024</div>
              </div>
              <div class="about-item">
                <div class="about-title">Hackathon Winner</div>
                <div class="about-subtitle">Best AI Project at TechHacks 2024</div>
              </div>
              <div class="about-item">
                <div class="about-title">Open Source Contributor</div>
                <div class="about-subtitle">500+ contributions on GitHub</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Tab Content -->
        <div class="tab-content" *ngIf="activeTab === 'media'">
          <div class="media-grid">
            <div *ngFor="let media of mediaItems; let i = index" class="media-item">
              <img [src]="media" [alt]="'Media ' + (i + 1)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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
