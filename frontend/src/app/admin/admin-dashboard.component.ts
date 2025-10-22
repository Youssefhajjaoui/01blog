import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { User, Post, Report, DashboardStats } from '../models';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  // Data properties
  users: User[] = [];
  posts: Post[] = [];
  reports: Report[] = [];
  stats: DashboardStats | null = null;

  // UI state
  activeTab: string = 'overview';
  userSearch: string = '';
  userStatusFilter: string = 'all';

  // Tab configuration
  tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
      badge: 0,
    },
    {
      id: 'users',
      name: 'Users',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>',
      badge: 0,
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>',
      badge: 0,
    },
  ];

  // Mock data for recent activity
  recentActivity = [
    {
      action: 'User Suspended',
      admin: 'Admin',
      target: 'john_doe',
      details: 'Violation of community guidelines',
      timestamp: '2 hours ago',
    },
    {
      action: 'Report Resolved',
      admin: 'Admin',
      target: 'spam_post_123',
      details: 'Content removed successfully',
      timestamp: '4 hours ago',
    },
    {
      action: 'User Banned',
      admin: 'Admin',
      target: 'spammer_user',
      details: 'Multiple policy violations',
      timestamp: '6 hours ago',
    },
    {
      action: 'Content Moderated',
      admin: 'Admin',
      target: 'inappropriate_content',
      details: 'Automated moderation action',
      timestamp: '8 hours ago',
    },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      users: this.adminService.getAllUsers().pipe(catchError(() => of([]))),
      posts: this.adminService.getAllPosts().pipe(catchError(() => of([]))),
      reports: this.adminService.getAllReports().pipe(catchError(() => of([]))),
      stats: this.adminService.getDashboardStats().pipe(catchError(() => of(null))),
    }).subscribe({
      next: (data) => {
        this.users = data.users;
        this.posts = data.posts;
        this.reports = data.reports;
        this.stats = data.stats;

        // Update tab badges
        this.updateTabBadges();

        // Calculate stats if backend doesn't provide them
        if (!this.stats) {
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Set fallback data
        this.calculateStats();
      },
    });
  }

  calculateStats(): void {
    if (!this.stats) {
      this.stats = {
        totalUsers: this.users.length,
        activeUsers: this.users.filter((u) => !u.banned).length,
        suspendedUsers: this.users.filter((u) => u.banned).length, // Using banned as suspended for now
        totalPosts: this.posts.length,
        pendingReports: this.reports.filter((r) => r.status === 'PENDING').length,
        criticalReports: this.reports.filter((r) => r.status === 'PENDING').length, // All pending reports as critical for now
        resolvedReports: this.reports.filter((r) => r.status === 'RESOLVED').length,
        platformHealth: 98.5,
        newUsersThisMonth: this.users.filter((u) => {
          const userDate = new Date(u.createdAt);
          const now = new Date();
          return (
            userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
          );
        }).length,
        newPostsThisMonth: this.posts.filter((p) => {
          const postDate = new Date(p.createdAt);
          const now = new Date();
          return (
            postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
          );
        }).length,
        topTags: this.getTopTags(),
        userGrowth: this.getUserGrowth(),
        postGrowth: this.getPostGrowth(),
      };
    }
  }

  updateTabBadges(): void {
    this.tabs[1].badge = this.users.filter((u) => u.banned).length; // Using banned as suspended for now
    this.tabs[2].badge = this.reports.filter((r) => r.status === 'PENDING').length;
  }

  private getTopTags(): { tag: string; count: number }[] {
    const tagCounts: { [key: string]: number } = {};

    this.posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags
  }

  private getUserGrowth(): { month: string; users: number }[] {
    const growth: { [key: string]: number } = {};

    this.users.forEach((user) => {
      const date = new Date(user.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growth[monthKey] = (growth[monthKey] || 0) + 1;
    });

    return Object.entries(growth)
      .map(([month, users]) => ({ month, users }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  private getPostGrowth(): { month: string; posts: number }[] {
    const growth: { [key: string]: number } = {};

    this.posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      growth[monthKey] = (growth[monthKey] || 0) + 1;
    });

    return Object.entries(growth)
      .map(([month, posts]) => ({ month, posts }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  get filteredUsers(): User[] {
    let filtered = this.users;

    if (this.userSearch) {
      const search = this.userSearch.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
      );
    }

    if (this.userStatusFilter !== 'all') {
      filtered = filtered.filter((user) => {
        switch (this.userStatusFilter) {
          case 'active':
            return !user.banned;
          case 'suspended':
            return user.banned; // Using banned as suspended for now
          case 'banned':
            return user.banned;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  getUserStatus(user: User): string {
    if (user.banned) return 'Banned';
    return 'Active';
  }

  getUserStatusClass(user: User): string {
    if (user.banned) return 'status-banned';
    return 'status-active';
  }

  getReportType(report: Report): string {
    return report.reportedPost ? 'Post' : 'User';
  }

  getReportTypeClass(report: Report): string {
    return report.reportedPost ? 'report-type-post' : 'report-type-user';
  }

  getReportStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'RESOLVED':
        return 'status-resolved';
      case 'DISMISSED':
        return 'status-dismissed';
      default:
        return 'status-pending';
    }
  }

  getPriorityColor(status: string): string {
    // Mock priority based on status for now
    if (status === 'PENDING') return 'priority-high';
    return 'priority-medium';
  }

  getTargetUser(report: Report): User {
    // Return the reported user or a mock user if not available
    if (report.reportedUser) {
      return report.reportedUser;
    }

    // Mock implementation - in real app, this would come from the report data
    return {
      id: 1,
      username: 'target_user',
      email: 'target@example.com',
      avatar: '',
      bio: '',
      role: 'USER',
      followers: 0,
      following: 0,
      posts: 0,
      banned: false,
      createdAt: new Date().toISOString(),
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  suspendUser(user: User) {
    this.adminService.suspendUser(user.id).subscribe({
      next: () => {
        console.log('User suspended:', user.id);
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error suspending user:', error);
      },
    });
  }

  banUser(user: User) {
    this.adminService.banUser(user.id).subscribe({
      next: () => {
        console.log('User banned:', user.id);
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error banning user:', error);
      },
    });
  }

  resolveReport(report: Report) {
    this.adminService.resolveReport(report.id).subscribe({
      next: () => {
        console.log('Report resolved:', report.id);
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error resolving report:', error);
      },
    });
  }

  dismissReport(report: Report) {
    this.adminService.dismissReport(report.id).subscribe({
      next: () => {
        console.log('Report dismissed:', report.id);
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Error dismissing report:', error);
      },
    });
  }

  getTodayUsers(): number {
    return this.stats?.totalUsers ? Math.floor(this.stats.totalUsers * 0.1) : 0;
  }

  getTodayPosts(): number {
    return this.stats?.totalPosts ? Math.floor(this.stats.totalPosts * 0.2) : 0;
  }

  // Navbar event handlers
  onSearchChange(query: string): void {
    // Handle search functionality if needed
    console.log('Search query:', query);
  }

  onNotificationClick(): void {
    // Handle notification click
    console.log('Notification clicked');
  }

  onUserClick(): void {
    // Handle user profile click
    console.log('User profile clicked');
  }

  onNavigate(event: any): void {
    // Handle navigation events
    console.log('Navigation event:', event);
  }
}
