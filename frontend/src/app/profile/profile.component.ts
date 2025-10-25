import { Component, OnInit, signal } from '@angular/core';
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
  // ✨ Convert all state to signals
  currentUser = signal<User | null>(null); // The logged-in user
  profileUser = signal<User | null>(null); // The user whose profile is being viewed
  userPosts = signal<Post[]>([]);
  activeTab = signal<'posts' | 'about' | 'media'>('posts');
  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = signal('');
  state = signal<{ currentUser: User | null }>({ currentUser: null });
  isOwnProfile = signal(true);
  isFollowing = signal(false);
  loading = signal(false);

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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.state.set({ currentUser: user });

    // Watch for route parameter changes
    this.route.params.subscribe(params => {
      const userId = params['userId'];

      console.log('Route params changed, userId:', userId);

      // Reset state when switching profiles
      this.userPosts.set([]);
      this.loading.set(true);

      if (userId) {
        // Viewing another user's profile
        this.isOwnProfile.set(false);
        this.loadUserProfile(Number(userId));
      } else {
        // Viewing own profile
        this.isOwnProfile.set(true);
        this.profileUser.set(this.currentUser());
        this.loading.set(false);
        this.loadUserPosts();
        // ✨ No more detectChanges - signals auto-update!
      }
    });
  }

  loadUserProfile(userId: number) {
    this.loading.set(true);
    // ✨ No more detectChanges - signals auto-update!

    this.userService.getUserProfile(userId).subscribe({
      next: (userProfile: any) => {
        console.log('Loaded user profile:', userProfile);

        // Map UserProfile to User
        this.profileUser.set({
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
        });

        // ✨ No more detectChanges - signals auto-update!

        // Check if following this user
        const currentUserId = this.currentUser()?.id;
        const profileUserId = this.profileUser()?.id;
        if (currentUserId && profileUserId && profileUserId !== currentUserId) {
          this.userService.isFollowing(userId).subscribe({
            next: (isFollowing) => {
              this.isFollowing.set(isFollowing);
              // ✨ No more detectChanges!
            },
            error: (error) => {
              console.error('Error checking follow status:', error);
            }
          });
        }

        this.loadUserPosts();
        this.loading.set(false);
        // ✨ No more detectChanges!
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.loading.set(false);
        // ✨ No more detectChanges!
        // Redirect to own profile if user not found
        this.router.navigate(['/profile']);
      }
    });
  }

  loadUserPosts() {
    const user = this.profileUser();
    if (!user) return;

    this.postService.getPosts().subscribe({
      next: (posts) => {
        // Filter posts by profile user
        const filtered = posts.filter((post) => post.author.id === user.id);
        this.userPosts.set(filtered);
        console.log('Loaded user posts:', filtered.length, 'posts for user', user.username);
        // ✨ No more detectChanges - signals auto-update!
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        // ✨ No more detectChanges!
      },
    });
  }

  getAvatarUrl(): string {
    const user = this.profileUser() || this.currentUser();
    if (user?.avatar) {
      const filename = user.avatar.split('/').pop();
      return `http://localhost:9090/api/files/uploads/${filename}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
  }

  setActiveTab(tab: 'posts' | 'about' | 'media') {
    this.activeTab.set(tab);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  navigateToSettings() {
    // TODO: Implement settings navigation
    console.log('Navigate to settings');
  }

  navigateToEditor() {
    this.router.navigate(['/create-post']);
  }

  toggleFollow() {
    const user = this.profileUser();
    if (!user || this.isOwnProfile()) return;

    if (this.isFollowing()) {
      // Unfollow
      this.userService.unfollowUser(user.id).subscribe({
        next: () => {
          this.isFollowing.set(false);
          // Update follower count
          this.profileUser.update(current => current ? {
            ...current,
            followers: Math.max(0, (current.followers || 0) - 1)
          } : null);
          // ✨ No more detectChanges - signals auto-update!
        },
        error: (error) => {
          console.error('Error unfollowing user:', error);
        }
      });
    } else {
      // Follow
      this.userService.followUser(user.id).subscribe({
        next: () => {
          this.isFollowing.set(true);
          // Update follower count
          this.profileUser.update(current => current ? {
            ...current,
            followers: (current.followers || 0) + 1
          } : null);
          // ✨ No more detectChanges - signals auto-update!
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
    this.searchQuery.set(query);
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
    this.userPosts.update(posts => posts.filter((p) => p.id !== postId));
    console.log('Post deleted:', postId);
  }

  onPostUpdated(updatedPost: Post) {
    this.userPosts.update(posts => {
      const index = posts.findIndex((p) => p.id === updatedPost.id);
      if (index !== -1) {
        const newPosts = [...posts];
        newPosts[index] = updatedPost;
        console.log('Post updated:', updatedPost);
        return newPosts;
      }
      return posts;
    });
  }

  // Helper methods for post interactions
  private handleLike(postId: string) {
    this.userPosts.update(posts => posts.map((post) =>
      post.id === Number(postId)
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
        : post
    ));
  }

  private handleSubscribe(userId: string) {
    this.userPosts.update(posts => posts.map((post) =>
      post.author.id === Number(userId) ? { ...post, isSubscribed: !post.isSubscribed } : post
    ));
  }

  private handleComment(postId: string) {
    const post = this.userPosts().find((p) => p.id === Number(postId));
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
