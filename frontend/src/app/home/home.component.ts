import { Component, OnInit, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { AppPostCardComponent } from '../post-card/post-card.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SuggestionsService } from '../services/suggestions.service';
import { NotificationService } from '../services/notification.service';
import { NotificationService as UINotificationService } from '../services/ui-notification.service';
import { User, Post, AppState, UserSuggestion } from '../models';

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

  // ✨ Convert to signals - no more ChangeDetectorRef needed!
  posts = signal<Post[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'following'>('all');
  viewMode = signal<'list' | 'grid'>('list');
  trendingTags = signal(trendingTags);
  searchQuery = signal('');
  currentPage = signal('home');
  currentUser = signal<User | null>(null);
  authUser = signal<User | null>(null);
  suggestedUsers = signal<UserSuggestion[]>([]);
  suggestionsLoading = signal(false);

  // Pagination
  page = signal(0);
  pageSize = signal(10);
  totalPosts = signal(0);
  hasMore = signal(true);

  // ✨ Computed signals for derived state
  filteredPosts = computed(() => {
    return this.posts().filter((post) => {
      switch (this.filter()) {
        case 'following':
          return post.isSubscribed;
        default:
          return true;
      }
    });
  });

  paginatedPosts = computed(() => {
    const start = this.page() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredPosts().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredPosts().length / this.pageSize());
  });

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private suggestionsService: SuggestionsService,
    private notificationService: NotificationService,
    private uiNotificationService: UINotificationService
  ) { }

  ngOnInit() {
    this.loadPosts();
    this.postService.getTrending().subscribe((tags) => {
      this.trendingTags.set(tags.trendingTags);
      // ✨ No more detectChanges - signals auto-update!
    });
    this.loadSuggestions();

    // Get authenticated user - use signal directly
    const user = this.authService.getCurrentUser();
    if (user) {
      this.authUser.set(user);
      this.currentUser.set(user);
      this.updateState.emit({ currentUser: user });
    }

    // Set current user from state if available
    if (this.state.currentUser) {
      this.currentUser.set(this.state.currentUser);
    }

    // Only load notifications if user is authenticated
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Load notifications from backend and connect to SSE
      this.notificationService.loadNotifications().subscribe();
      this.notificationService.loadUnreadCount().subscribe();
      this.notificationService.connectToNotifications();
    }
  }
  onPostDeleted(postId: number) {
    this.posts.update(posts => posts.filter((p) => p.id !== postId));
    // Success message is handled by the post-card component
  }

  onPostUpdated(updatedPost: Post) {
    // Find and update the post in the posts array
    this.posts.update(posts => {
      const index = posts.findIndex((p) => p.id === updatedPost.id);
      if (index !== -1) {
        const newPosts = [...posts];
        newPosts[index] = updatedPost;
        return newPosts;
      }
      return posts;
    });
    this.uiNotificationService.success('Post updated successfully');
  }

  loadPosts() {
    this.loading.set(true);
    this.postService.getPosts().subscribe({
      next: (posts) => {
        console.log('Fetched posts:', posts);
        this.posts.set(posts);
        this.totalPosts.set(posts.length);
        this.loading.set(false);
        // ✨ No more detectChanges - signals auto-update!
      },

      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    if ((this.page() + 1) * this.pageSize() < this.filteredPosts().length) {
      this.page.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number) {
    this.page.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadSuggestions() {
    this.suggestionsLoading.set(true);
    this.suggestionsService.getSuggestedUsers().subscribe({
      next: (suggestions) => {
        console.log('Fetched suggestions:', suggestions);
        this.suggestedUsers.set(suggestions);
        this.suggestionsLoading.set(false);
        // ✨ No more detectChanges - signals auto-update!
      },
      error: (err) => {
        console.error('Error loading suggestions:', err);
        this.suggestionsLoading.set(false);
      },
    });
  }

  getFirstName(): string {
    return this.state.currentUser?.username?.split(' ')[0] || 'User';
  }

  getAvatarUrl(): string {
    const user = this.authUser();
    if (user?.avatar) {
      // If user has uploaded avatar, use the backend API endpoint
      // Extract filename from the full path (e.g., "uploads/filename.jpg" -> "filename.jpg")
      const filename = user.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
  }

  getSuggestedUserAvatarUrl(user: UserSuggestion): string {
    if (user.image) {
      // If user has uploaded avatar, use the backend API endpoint
      const filename = user.image.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  }

  handleLike(postId: string) {
    this.posts.update(posts =>
      posts.map((post) =>
        post.id === Number(postId)
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
          : post
      )
    );
  }

  handleSubscribe(userId: string) {
    const userIdNum = Number(userId);

    // Check if it's a post author or a suggested user
    const post = this.posts().find((p) => p.author.id === userIdNum);
    const suggestedUser = this.suggestedUsers().find((u) => u.id === userIdNum);

    if (post) {
      // Handle post author follow/unfollow
      const isCurrentlySubscribed = post.isSubscribed || false;

      if (isCurrentlySubscribed) {
        // Unfollow
        this.userService.unfollowUser(userIdNum).subscribe({
          next: () => {
            this.posts.update(posts =>
              posts.map((p) =>
                p.author.id === userIdNum ? { ...p, isSubscribed: false } : p
              )
            );
            this.uiNotificationService.success('Unfollowed successfully');
          },
          error: (error) => {
            console.error('Error unfollowing user:', error);
            this.uiNotificationService.error('Failed to unfollow user');
          },
        });
      } else {
        // Follow
        this.userService.followUser(userIdNum).subscribe({
          next: () => {
            this.posts.update(posts =>
              posts.map((p) =>
                p.author.id === userIdNum ? { ...p, isSubscribed: true } : p
              )
            );
            this.uiNotificationService.success('Followed successfully');
          },
          error: (error) => {
            console.error('Error following user:', error);
            this.uiNotificationService.error('Failed to follow user');
          },
        });
      }
    } else if (suggestedUser) {
      // Handle suggested user follow/unfollow
      const isCurrentlyFollowing = suggestedUser.isFollowing || false;

      if (isCurrentlyFollowing) {
        // Unfollow
        this.userService.unfollowUser(userIdNum).subscribe({
          next: () => {
            this.suggestedUsers.update(users =>
              users.map((u) =>
                u.id === userIdNum
                  ? { ...u, isFollowing: false, followerCount: Math.max(0, u.followerCount - 1) }
                  : u
              )
            );
            this.uiNotificationService.success('Unfollowed successfully');
          },
          error: (error) => {
            console.error('Error unfollowing user:', error);
            this.uiNotificationService.error('Failed to unfollow user');
          },
        });
      } else {
        // Follow
        this.userService.followUser(userIdNum).subscribe({
          next: () => {
            this.suggestedUsers.update(users =>
              users.map((u) =>
                u.id === userIdNum
                  ? { ...u, isFollowing: true, followerCount: u.followerCount + 1 }
                  : u
              )
            );
            this.uiNotificationService.success('Followed successfully');
          },
          error: (error) => {
            console.error('Error following user:', error);
            this.uiNotificationService.error('Failed to follow user');
          },
        });
      }
    }
  }

  handleComment(postId: string) {
    this.router.navigate(['/post', postId]);
  }

  handlePostClick(post: Post) {
    this.router.navigate(['/post', post.id]);
  }

  handleUserClick(userId: string) {
    // Navigate to profile page - could be current user or other user
    const currentUserId = this.currentUser()?.id.toString();
    if (userId && userId !== currentUserId) {
      // Navigate to other user's profile
      this.router.navigate(['/profile', userId]);
    } else {
      // Navigate to own profile
      this.router.navigate(['/profile']);
    }
  }

  handleReport(postId: string) {
    this.updateState.emit({
      showReportModal: true,
      reportTarget: { type: 'post', id: Number(postId) },
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
    } else if (page === 'profile') {
      this.router.navigate(['/profile']);
    } else {
      this.navigateTo.emit({ page });
    }
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    // Implement search functionality
  }

  onNotificationClick() {
    // Implement notification functionality
  }
}
