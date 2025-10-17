import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post';
import { AppPostCardComponent } from '../post-card/post-card.component';
import { AuthService, User as AuthUser } from '../services/auth.service';
import { NavbarComponent } from '../components/navbar/navbar.component';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  subscribers: number;
  posts: number;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  excerpt: string;
  media?: { type: string; url: string; alt: string }[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSubscribed: boolean;
  createdAt: string;
  visibility: string;
}

export interface AppState {
  currentUser?: User;
  posts?: Post[];
  users?: User[];
  showReportModal?: boolean;
  reportTarget?: { type: string; id: string };
}

const mockUsers: User[] = [
  {
    id: '5',
    name: 'Emma Chen',
    email: 'emma@example.com',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Frontend developer sharing design tips',
    role: 'user',
    subscribers: 2100,
    posts: 89,
  },
  {
    id: '6',
    name: 'David Rodriguez',
    email: 'david@example.com',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Backend engineer and mentor',
    role: 'user',
    subscribers: 1680,
    posts: 156,
  },
  {
    id: '7',
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'DevOps student and open source contributor',
    role: 'user',
    subscribers: 934,
    posts: 73,
  },
];

const trendingTags = [
  { tag: 'react', count: 1450 },
  { tag: 'python', count: 1200 },
  { tag: 'javascript', count: 1100 },
  { tag: 'webdev', count: 980 },
  { tag: 'machinelearning', count: 850 },
  { tag: 'career', count: 720 },
  { tag: 'tutorial', count: 650 },
  { tag: 'beginners', count: 580 },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AppPostCardComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomePageComponent implements OnInit {
  @Input() variant: string = 'feed';
  @Input() state: AppState = {};
  @Output() navigateTo = new EventEmitter<{ page: string; data?: any }>();
  @Output() updateState = new EventEmitter<Partial<AppState>>();
  @Output() userClick = new EventEmitter<string>();
  @Output() report = new EventEmitter<string>();
  @Output() postClick = new EventEmitter<Post>();
  constructor(
    private postService: PostService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) { }

  posts: Post[] = [];
  loading = true;
  filter: 'all' | 'following' | 'trending' = 'all';
  viewMode: 'list' | 'grid' = 'list';
  mockUsers = mockUsers;
  trendingTags = trendingTags;
  searchQuery = '';
  currentPage = 'home';
  currentUser: User | null = null;
  authUser: AuthUser | null = null;

  ngOnInit() {
    this.loadPosts();
    // Get authenticated user
    this.authService.currentUser$.subscribe(user => {
      this.authUser = user;
    });
    // Set current user from state if available
    if (this.state.currentUser) {
      this.currentUser = this.state.currentUser;
    } else {
      // Fallback to mock user for display
      this.currentUser = {
        id: '1',
        name: 'Current User',
        email: 'user@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        bio: 'Student',
        role: 'user',
        subscribers: 0,
        posts: 0
      };
    }
  }

  loadPosts() {
    this.loading = true;
    this.postService.getPosts().subscribe({
      next: (posts) => {
        console.log('Fetched posts:', posts);
        this.posts = posts;
        this.loading = false;
        this.cd.detectChanges(); // 👈 ensures Angular updates the DOM
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  get filteredPosts(): Post[] {
    return this.posts.filter((post) => {
      switch (this.filter) {
        case 'following':
          return post.isSubscribed;
        case 'trending':
          return post.likes > 100;
        default:
          return true;
      }
    });
  }

  getFirstName(): string {
    return this.state.currentUser?.name?.split(' ')[0] || 'User';
  }

  getAvatarUrl(): string {
    if (this.authUser?.image) {
      // If user has uploaded avatar, use the backend API endpoint
      // Extract filename from the full path (e.g., "uploads/filename.jpg" -> "filename.jpg")
      const filename = this.authUser.image.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.authUser?.username || 'user'}`;
  }

  handleLike(postId: string) {
    this.posts = this.posts.map((post) =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
        : post
    );
  }

  handleSubscribe(userId: string) {
    this.posts = this.posts.map((post) =>
      post.author.id === userId ? { ...post, isSubscribed: !post.isSubscribed } : post
    );
  }

  handleComment(postId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      this.navigateTo.emit({ page: 'post', data: { post } });
    }
  }

  handlePostClick(post: Post) {
    this.navigateTo.emit({ page: 'post', data: { post } });
  }

  handleUserClick(userId: string) {
    const user =
      this.mockUsers.find((u) => u.id === userId) ||
      this.posts.find((p) => p.author.id === userId)?.author;
    if (user) {
      this.navigateTo.emit({ page: 'profile', data: { user } });
    }
  }

  handleReport(postId: string) {
    this.updateState.emit({
      showReportModal: true,
      reportTarget: { type: 'post', id: postId },
    });
  }

  // Event handlers for template
  onLike(event: any) {
    const postId = event?.postId || event?.detail?.postId || '';
    this.handleLike(postId);
  }

  onSubscribeEvent(event: any) {
    // Try to extract userId from event
    const userId = event?.userId || event?.detail?.userId || '';
    if (userId) {
      this.handleSubscribe(userId);
    }
  }

  onComment(event: any) {
    // Try to extract postId from event
    const postId = event?.postId || event?.detail?.postId || '';
    if (postId) {
      this.handleComment(postId);
    }
  }

  onPostClick(event: any) {
    // Try to extract the post object from the event
    const post = event?.post || event?.detail?.post;
    if (post) {
      this.handlePostClick(post);
    }
  }

  onUserClickEvent(event: any) {
    // If event is an Event, extract userId from event.target or event.detail
    const userId = event?.userId || event?.detail?.userId || '';
    if (userId) {
      this.handleUserClick(userId);
    }
  }

  onReport(event: any) {
    // If event is an Event, extract postId from event.target or event.detail
    const postId = event?.postId || event?.detail?.postId || '';
    if (postId) {
      this.handleReport(postId);
    }
  }

  onUserClick() {
    // Implement user menu functionality
  }

  onUserProfileClick(userId: string) {
    this.handleUserClick(userId);
  }

  onSubscribe(userId: string) {
    this.handleSubscribe(userId);
  }

  onNavigate(page: string) {
    if (page === 'editor') {
      this.router.navigate(['/create-post']);
    } else {
      this.navigateTo.emit({ page });
    }
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    // Implement search functionality
  }

  onNotificationClick() {
    // Implement notification functionality
  }
}
