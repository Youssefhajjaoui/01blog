import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer and CS student',
      role: 'user',
      subscribers: 856,
      posts: 24,
    },
    title: "Understanding React Hooks: A Beginner's Guide",
    content: 'React Hooks have revolutionized how we write React components...',
    excerpt:
      "Learn the fundamentals of React Hooks and how they can simplify your component logic. We'll cover useState, useEffect, and custom hooks.",
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=1080',
        alt: 'React code on screen',
      },
    ],
    tags: ['react', 'javascript', 'webdev', 'hooks'],
    likes: 142,
    comments: 28,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-15T10:30:00Z',
    visibility: 'public',
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Maya Patel',
      email: 'maya@example.com',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Science student at MIT',
      role: 'user',
      subscribers: 1230,
      posts: 67,
    },
    title: 'My Journey from Zero to Machine Learning Engineer',
    content: 'Six months ago, I knew nothing about machine learning...',
    excerpt:
      'A personal story about transitioning from web development to machine learning, including the resources and projects that helped me along the way.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?w=1080',
        alt: 'Students learning',
      },
    ],
    tags: ['machinelearning', 'python', 'career', 'journey'],
    likes: 89,
    comments: 15,
    isLiked: true,
    isSubscribed: true,
    createdAt: '2024-01-14T15:45:00Z',
    visibility: 'public',
  },
  {
    id: '3',
    author: {
      id: '4',
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'CS Senior at Stanford, iOS enthusiast',
      role: 'user',
      subscribers: 445,
      posts: 31,
    },
    title: 'Building My First iOS App: Lessons Learned',
    content: 'After months of learning Swift and iOS development...',
    excerpt:
      'Key takeaways from developing my first iOS application, including common pitfalls and helpful resources for beginners.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?w=1080',
        alt: 'Programming tutorial',
      },
    ],
    tags: ['ios', 'swift', 'mobile', 'beginner'],
    likes: 67,
    comments: 12,
    isLiked: false,
    isSubscribed: false,
    createdAt: '2024-01-13T09:20:00Z',
    visibility: 'public',
  },
];

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
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomePageComponent implements OnInit {
  @Input() state: AppState = {};
  @Output() navigateTo = new EventEmitter<{ page: string; data?: any }>();
  @Output() updateState = new EventEmitter<Partial<AppState>>();

  posts: Post[] = [];
  loading = true;
  filter: 'all' | 'following' | 'trending' = 'all';
  viewMode: 'list' | 'grid' = 'list';
  mockUsers = mockUsers;
  trendingTags = trendingTags;

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    this.loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.posts = mockPosts;
    this.updateState.emit({ posts: mockPosts, users: mockUsers });
    this.loading = false;
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
  onLike(postId: string) {
    this.handleLike(postId);
  }

  onSubscribeEvent(userId: string) {
    this.handleSubscribe(userId);
  }

  onComment(postId: string) {
    this.handleComment(postId);
  }

  onPostClick(post: Post) {
    this.handlePostClick(post);
  }

  onUserClickEvent(userId: string) {
    this.handleUserClick(userId);
  }

  onReport(postId: string) {
    this.handleReport(postId);
  }

  onUserClick(userId: string) {
    this.handleUserClick(userId);
  }

  onSubscribe(userId: string) {
    this.handleSubscribe(userId);
  }

  onNavigate(page: string) {
    this.navigateTo.emit({ page });
  }
}
