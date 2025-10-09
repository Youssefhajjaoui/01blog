import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { AppState } from '../../models/app-state.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePageComponent implements OnInit {
  protected readonly title = signal('Profile');
  
  user: User | null = null;
  posts: Post[] = [];
  isOwnProfile = false;
  loading = true;
  activeTab = 'posts';
  
  // Mock data
  private mockUser: User = {
    id: '2',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer and CS student passionate about creating meaningful applications.',
    role: 'user',
    subscribers: 856,
    posts: 24,
    createdAt: '2023-01-15T10:30:00Z'
  };

  private mockPosts: Post[] = [
    {
      id: '1',
      author: this.mockUser,
      title: 'Understanding React Hooks: A Beginner\'s Guide',
      content: 'React Hooks have revolutionized how we write React components...',
      excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic.',
      media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'React code on screen' }],
      tags: ['react', 'javascript', 'webdev', 'hooks'],
      likes: 142,
      comments: 28,
      isLiked: false,
      isSubscribed: false,
      createdAt: '2024-01-15T10:30:00Z',
      visibility: 'public'
    },
    {
      id: '2',
      author: this.mockUser,
      title: 'Building My First Full-Stack App',
      content: 'After months of learning, I finally built my first full-stack application...',
      excerpt: 'A journey through building a complete web application from frontend to backend.',
      tags: ['fullstack', 'javascript', 'nodejs', 'mongodb'],
      likes: 89,
      comments: 15,
      isLiked: true,
      isSubscribed: false,
      createdAt: '2024-01-10T15:45:00Z',
      visibility: 'public'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.loadUserProfile(userId);
    });
  }

  private loadUserProfile(userId?: string): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.user = this.mockUser;
      this.posts = this.mockPosts;
      this.isOwnProfile = !userId; // If no userId, it's own profile
      this.loading = false;
    }, 1000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  editProfile(): void {
    // Navigate to profile edit or open modal
    console.log('Edit profile');
  }

  followUser(): void {
    if (this.user) {
      this.user.subscribers += 1;
      // Add follow logic here
    }
  }

  unfollowUser(): void {
    if (this.user) {
      this.user.subscribers -= 1;
      // Add unfollow logic here
    }
  }

  likePost(postId: string): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
    }
  }

  navigateToPost(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  navigateToEditor(): void {
    this.router.navigate(['/editor']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
