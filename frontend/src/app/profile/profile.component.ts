import { Component, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { User, Post } from '../models';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { AppPostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, AppPostCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null; // The logged-in user
  profileUser: User | null = null; // The user whose profile is being viewed
  userPosts: Post[] = [];
  activeTab: 'posts' | 'about' | 'media' = 'posts';
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';
  state: { currentUser: User | null } = { currentUser: null };
  isOwnProfile: boolean = true;
  isFollowing: boolean = false;
  loading: boolean = false;

  // Mock media items for the media tab
  mediaItems = [
    'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHx8MTc1ODc5NzI2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.state.currentUser = this.currentUser;

    // Watch for route parameter changes
    this.route.params.subscribe(params => {
      const userId = params['userId'];

      console.log('Route params changed, userId:', userId);

      // Reset state when switching profiles
      this.userPosts = [];
      this.loading = true;

      if (userId) {
        // Viewing another user's profile
        this.isOwnProfile = false;
        this.loadUserProfile(Number(userId));
      } else {
        // Viewing own profile
        this.isOwnProfile = true;
        this.profileUser = this.currentUser;
        this.loading = false;
        this.loadUserPosts();
        // Force change detection for own profile
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  loadUserProfile(userId: number) {
    this.loading = true;
    this.cdr.detectChanges(); // Force change detection for loading state

    this.userService.getUserProfile(userId).subscribe({
      next: (userProfile: any) => {
        console.log('Loaded user profile:', userProfile);

        // Map UserProfile to User
        this.profileUser = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          avatar: userProfile.image,
          bio: userProfile.bio,
          role: userProfile.role,
          followers: userProfile.followerCount || 0,
          following: userProfile.followingCount || 0,
          posts: userProfile.postCount || 0,
          createdAt: userProfile.createdAt || new Date().toISOString()
        };

        // Force change detection after setting profileUser
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 0);

        // Check if following this user
        if (this.currentUser && this.profileUser.id !== this.currentUser.id) {
          this.userService.isFollowing(userId).subscribe({
            next: (isFollowing) => {
              this.isFollowing = isFollowing;
              // Force change detection for follow status
              this.cdr.markForCheck();
              this.cdr.detectChanges();
              setTimeout(() => this.cdr.detectChanges(), 0);
            },
            error: (error) => {
              console.error('Error checking follow status:', error);
            }
          });
        }

        this.loadUserPosts();
        this.loading = false;
        // Force change detection after loading complete
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 0);
        // Redirect to own profile if user not found
        this.router.navigate(['/profile']);
      }
    });
  }

  loadUserPosts() {
    if (!this.profileUser) return;

    this.postService.getPosts().subscribe({
      next: (posts) => {
        // Filter posts by profile user
        this.userPosts = posts.filter((post) => post.author.id === this.profileUser?.id);
        console.log('Loaded user posts:', this.userPosts.length, 'posts for user', this.profileUser?.username);
        this.cdr.detectChanges(); // Force change detection after loading posts
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.cdr.detectChanges();
      },
    });
  }

  getAvatarUrl(): string {
    const user = this.profileUser || this.currentUser;
    if (user?.avatar) {
      const filename = user.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
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

  toggleFollow() {
    if (!this.profileUser || this.isOwnProfile) return;

    if (this.isFollowing) {
      // Unfollow
      this.userService.unfollowUser(this.profileUser.id).subscribe({
        next: () => {
          this.isFollowing = false;
          if (this.profileUser) {
            this.profileUser.followers = Math.max(0, (this.profileUser.followers || 0) - 1);
          }
          // Force change detection multiple times to ensure UI updates
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.appRef.tick();
          setTimeout(() => {
            this.cdr.detectChanges();
            this.appRef.tick();
          }, 0);
        },
        error: (error) => {
          console.error('Error unfollowing user:', error);
        }
      });
    } else {
      // Follow
      this.userService.followUser(this.profileUser.id).subscribe({
        next: () => {
          this.isFollowing = true;
          if (this.profileUser) {
            this.profileUser.followers = (this.profileUser.followers || 0) + 1;
          }
          // Force change detection multiple times to ensure UI updates
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          this.appRef.tick();
          setTimeout(() => {
            this.cdr.detectChanges();
            this.appRef.tick();
          }, 0);
        },
        error: (error) => {
          console.error('Error following user:', error);
        }
      });
    }
  }

  viewPost(post: Post) {
    // TODO: Implement post viewing
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

  // Event handlers for post interactions
  onLike(event: any) {
    const postId = event?.postId || event?.detail?.postId || '';
    if (postId) {
      this.handleLike(postId);
    }
  }

  onSubscribeEvent(event: any) {
    const userId = event?.userId || event?.detail?.userId || '';
    if (userId) {
      this.handleSubscribe(userId);
    }
  }

  onComment(event: any) {
    const postId = event?.postId || event?.detail?.postId || '';
    if (postId) {
      this.handleComment(postId);
    }
  }

  onPostClick(event: any) {
    const post = event?.post || event?.detail?.post;
    if (post) {
      this.handlePostClick(post);
    }
  }

  onUserClickEvent(event: any) {
    const userId = event?.userId || event?.detail?.userId || '';
    if (userId) {
      this.handleUserClick(userId);
    }
  }

  onReport(event: any) {
    const postId = event?.postId || event?.detail?.postId || '';
    if (postId) {
      this.handleReport(postId);
    }
  }

  onPostDeleted(postId: number) {
    this.userPosts = this.userPosts.filter((p) => p.id !== postId);
    console.log('Post deleted:', postId);
  }

  onPostUpdated(updatedPost: Post) {
    const index = this.userPosts.findIndex((p) => p.id === updatedPost.id);
    if (index !== -1) {
      this.userPosts[index] = updatedPost;
      console.log('Post updated:', updatedPost);
    }
  }

  // Helper methods for post interactions
  private handleLike(postId: string) {
    this.userPosts = this.userPosts.map((post) =>
      post.id === Number(postId)
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
        : post
    );
  }

  private handleSubscribe(userId: string) {
    this.userPosts = this.userPosts.map((post) =>
      post.author.id === Number(userId) ? { ...post, isSubscribed: !post.isSubscribed } : post
    );
  }

  private handleComment(postId: string) {
    const post = this.userPosts.find((p) => p.id === Number(postId));
    if (post) {
      console.log('Navigate to post comments:', post);
      // TODO: Implement comment navigation
    }
  }

  private handlePostClick(post: Post) {
    console.log('Navigate to post:', post);
    // TODO: Implement post navigation
  }

  private handleUserClick(userId: string) {
    console.log('Navigate to user profile:', userId);
    // Navigate to user profile
    this.router.navigate(['/profile', userId]);
  }

  private handleReport(postId: string) {
    console.log('Report post:', postId);
    // TODO: Implement report functionality
  }
}
