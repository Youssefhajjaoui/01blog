import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})

export class AdminDashboardComponent implements OnInit {
  protected readonly title = signal('Admin Dashboard');
  
  activeTab = 'overview';
  loading = false;
  
  // Mock data
  stats = {
    totalUsers: 1250,
    totalPosts: 3420,
    totalComments: 12800,
    activeUsers: 890
  };

  recentUsers: User[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Computer Science student',
      role: 'user',
      subscribers: 1234,
      posts: 42,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer',
      role: 'user',
      subscribers: 856,
      posts: 24,
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      name: 'Maya Patel',
      email: 'maya@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Science student',
      role: 'user',
      subscribers: 1230,
      posts: 67,
      createdAt: '2024-01-13T09:20:00Z'
    }
  ];

  recentPosts: Post[] = [
    {
      id: '1',
      author: this.recentUsers[0],
      title: 'Understanding React Hooks: A Beginner\'s Guide',
      content: 'React Hooks have revolutionized how we write React components...',
      excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic.',
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
      author: this.recentUsers[1],
      title: 'Building My First Full-Stack App',
      content: 'After months of learning, I finally built my first full-stack application...',
      excerpt: 'A journey through building a complete web application from frontend to backend.',
      tags: ['fullstack', 'javascript', 'nodejs', 'mongodb'],
      likes: 89,
      comments: 15,
      isLiked: false,
      isSubscribed: false,
      createdAt: '2024-01-14T15:45:00Z',
      visibility: 'public'
    }
  ];

  reportedContent = [
    {
      id: '1',
      type: 'post',
      reason: 'Inappropriate content',
      reporter: 'User123',
      content: 'Post about React hooks',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'user',
      reason: 'Spam account',
      reporter: 'User456',
      content: 'User profile',
      status: 'reviewed',
      createdAt: '2024-01-14T15:45:00Z'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  banUser(userId: string): void {
    if (confirm('Are you sure you want to ban this user?')) {
      // Implement ban user logic
      console.log('Ban user:', userId);
      alert('User banned successfully');
    }
  }

  deletePost(postId: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      // Implement delete post logic
      console.log('Delete post:', postId);
      alert('Post deleted successfully');
    }
  }

  approveReport(reportId: string): void {
    // Implement approve report logic
    console.log('Approve report:', reportId);
    const report = this.reportedContent.find(r => r.id === reportId);
    if (report) {
      report.status = 'approved';
    }
    alert('Report approved');
  }

  dismissReport(reportId: string): void {
    // Implement dismiss report logic
    console.log('Dismiss report:', reportId);
    const report = this.reportedContent.find(r => r.id === reportId);
    if (report) {
      report.status = 'dismissed';
    }
    alert('Report dismissed');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-success';
      case 'dismissed':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
}
