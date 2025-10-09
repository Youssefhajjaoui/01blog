import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { NavigationComponent } from '../../components/navigation/navigation.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, NavigationComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss'
})
export class HomePageComponent implements OnInit {
  currentUser: User | null = null;
  posts: Post[] = [];
  suggestedUsers: User[] = [];
  trendingTags: { tag: string; count: number }[] = [];
  loading = true;
  filter: 'all' | 'following' | 'trending' = 'all';
  viewMode: 'list' | 'grid' = 'list';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Simulate loading delay
    setTimeout(() => {
      this.loadMockData();
      this.loading = false;
    }, 1000);
  }

  loadMockData(): void {
    // Mock posts data
    this.posts = [
      {
        id: '1',
        author: {
          id: '2',
          name: 'Alex Rivera',
          email: 'alex@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Full-stack developer and CS student',
          role: 'user',
          subscribers: 856,
          posts: 24
        },
        title: 'Understanding React Hooks: A Beginner\'s Guide',
        content: 'React Hooks have revolutionized how we write React components...',
        excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic. We\'ll cover useState, useEffect, and custom hooks.',
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
        author: {
          id: '3',
          name: 'Maya Patel',
          email: 'maya@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
          bio: 'Data Science student at MIT',
          role: 'user',
          subscribers: 1230,
          posts: 67
        },
        title: 'My Journey from Zero to Machine Learning Engineer',
        content: 'Six months ago, I knew nothing about machine learning...',
        excerpt: 'A personal story about transitioning from web development to machine learning, including the resources and projects that helped me along the way.',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'Students learning computer science' }],
        tags: ['machinelearning', 'python', 'career', 'journey'],
        likes: 89,
        comments: 15,
        isLiked: true,
        isSubscribed: true,
        createdAt: '2024-01-14T15:45:00Z',
        visibility: 'public'
      },
      {
        id: '3',
        author: {
          id: '4',
          name: 'Jordan Kim',
          email: 'jordan@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'CS Senior at Stanford, iOS enthusiast',
          role: 'user',
          subscribers: 445,
          posts: 31
        },
        title: 'Building My First iOS App: Lessons Learned',
        content: 'After months of learning Swift and iOS development...',
        excerpt: 'Key takeaways from developing my first iOS application, including common pitfalls and helpful resources for beginners.',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHwxNzU4Nzk3MjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', alt: 'Programming tutorial on screen' }],
        tags: ['ios', 'swift', 'mobile', 'beginner'],
        likes: 67,
        comments: 12,
        isLiked: false,
        isSubscribed: false,
        createdAt: '2024-01-13T09:20:00Z',
        visibility: 'public'
      }
    ];

    // Mock suggested users
    this.suggestedUsers = [
      {
        id: '5',
        name: 'Emma Chen',
        email: 'emma@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Frontend developer sharing design tips',
        role: 'user',
        subscribers: 2100,
        posts: 89
      },
      {
        id: '6',
        name: 'David Rodriguez',
        email: 'david@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Backend engineer and mentor',
        role: 'user',
        subscribers: 1680,
        posts: 156
      },
      {
        id: '7',
        name: 'Lisa Wang',
        email: 'lisa@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
        bio: 'DevOps student and open source contributor',
        role: 'user',
        subscribers: 934,
        posts: 73
      }
    ];

    // Mock trending tags
    this.trendingTags = [
      { tag: 'react', count: 1450 },
      { tag: 'python', count: 1200 },
      { tag: 'javascript', count: 1100 },
      { tag: 'webdev', count: 980 },
      { tag: 'machinelearning', count: 850 },
      { tag: 'career', count: 720 },
      { tag: 'tutorial', count: 650 },
      { tag: 'beginners', count: 580 }
    ];
  }

  get filteredPosts(): Post[] {
    switch (this.filter) {
      case 'following':
        return this.posts.filter(post => post.isSubscribed);
      case 'trending':
        return this.posts.filter(post => post.likes > 100);
      default:
        return this.posts;
    }
  }

  onLike(postId: string): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
    }
  }

  onSubscribe(userId: string): void {
    this.posts.forEach(post => {
      if (post.author.id === userId) {
        post.isSubscribed = !post.isSubscribed;
      }
    });
  }

  onComment(postId: string): void {
    this.router.navigate(['/post', postId]);
  }

  onPostClick(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  onUserClick(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  onReport(postId: string): void {
    console.log('Report post:', postId);
    // Implement report functionality
  }

  onWritePost(): void {
    this.router.navigate(['/editor']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  onNavigate(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  onToggleNotifications(): void {
    console.log('Toggle notifications');
    // Implement notifications toggle
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}