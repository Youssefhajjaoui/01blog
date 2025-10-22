import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { AppPostCardComponent } from '../post-card/post-card.component';
import { AuthService } from '../services/auth.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SuggestionsService } from '../services/suggestions.service';
import { User, Post, AppState, UserSuggestion } from '../models';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private router: Router,
    private suggestionsService: SuggestionsService,
    private snackBar: MatSnackBar
  ) { }

  posts: Post[] = [];
  loading = true;
  filter: 'all' | 'following' | 'trending' = 'all';
  viewMode: 'list' | 'grid' = 'list';
  mockUsers = [];
  trendingTags = trendingTags;
  searchQuery = '';
  currentPage = 'home';
  currentUser: User | null = null;
  authUser: User | null = null;
  suggestedUsers: UserSuggestion[] = [];
  suggestionsLoading = false;

  ngOnInit() {
    this.loadPosts();
    this.postService.getTrending().subscribe((tags) => {
      this.trendingTags = tags.trendingTags;
      this.cd.detectChanges();
    });
    this.loadSuggestions();
    // Get authenticated user
    this.authService.currentUser$.subscribe((user) => {
      this.authUser = user;
      console.log('Current user:', user);

      // Update state.currentUser with authUser data including statistics
      if (user) {
        this.currentUser = user;

        // Update the state to trigger template updates
        this.updateState.emit({ currentUser: this.currentUser });
      }

      this.cd.detectChanges();
    });

    // Set current user from state if available
    if (this.state.currentUser) {
      this.currentUser = this.state.currentUser;
    } else {
      // this.router.navigate(["/auth"]);
    }
  }
  onPostDeleted(postId: number) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.cd.detectChanges();
    this.snackBar.open('Post deleted', 'Close', { duration: 2000 });
  }

  onPostUpdated(updatedPost: Post) {
    // Find and update the post in the posts array
    const index = this.posts.findIndex((p) => p.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
      this.cd.detectChanges();
      this.snackBar.open('Post updated successfully', 'Close', { duration: 2000 });
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

  loadSuggestions() {
    this.suggestionsLoading = true;
    this.suggestionsService.getSuggestedUsers().subscribe({
      next: (suggestions) => {
        console.log('Fetched suggestions:', suggestions);
        this.suggestedUsers = suggestions;
        this.suggestionsLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading suggestions:', err);
        // this.suggestionsLoading = false;
        // // Fallback to mock users if API fails
        // this.suggestedUsers = this.mockUsers.map(user => ({
        //   id: parseInt(user.id),
        //   username: user.name,
        //   email: user.email,
        //   image: user.avatar,
        //   bio: user.bio,
        //   role: user.role,
        //   followerCount: user.subscribers,
        //   postCount: user.posts,
        //   suggestionScore: user.subscribers + user.posts
        // }));
        // this.cd.detectChanges();
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
    return this.state.currentUser?.username?.split(' ')[0] || 'User';
  }

  getAvatarUrl(): string {
    if (this.authUser?.avatar) {
      // If user has uploaded avatar, use the backend API endpoint
      // Extract filename from the full path (e.g., "uploads/filename.jpg" -> "filename.jpg")
      const filename = this.authUser.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.authUser?.username || 'user'}`;
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
    this.posts = this.posts.map((post) =>
      post.id === Number(postId)
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
      post.author.id === Number(userId) ? { ...post, isSubscribed: !post.isSubscribed } : post
    );
  }

  handleComment(postId: string) {
    const post = this.posts.find((p) => p.id === Number(postId));
    if (post) {
      this.navigateTo.emit({ page: 'post', data: { post } });
    }
  }

  handlePostClick(post: Post) {
    this.navigateTo.emit({ page: 'post', data: { post } });
  }

  handleUserClick(userId: string) {
    // Navigate to profile page - could be current user or other user
    if (userId && userId !== this.currentUser?.id.toString()) {
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
    this.searchQuery = query;
    // Implement search functionality
  }

  onNotificationClick() {
    // Implement notification functionality
  }
}
