import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { User, Post, Report, DashboardStats } from '../models';
import { Observable, forkJoin, of, Subject } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Data properties
  users: User[] = [];
  posts: Post[] = [];
  reports: Report[] = [];
  stats: DashboardStats | null = null;

  // UI state
  activeTab: string = 'overview';
  userSearch: string = '';
  userStatusFilter: string = 'all';

  // Modal state
  showBanModal = false;
  showDeleteModal = false;
  selectedUser: User | null = null;
  banDuration: number = 30;
  banDurationUnit: string = 'days';
  banReason: string = '';
  deleteReason: string = '';
  isPermanentBan = false;

  // Change detection
  private destroy$ = new Subject<void>();
  private isLoading = false;

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
      action: 'User Banned',
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

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    forkJoin({
      users: this.adminService.getAllUsers().pipe(catchError(() => of([]))),
      posts: this.adminService.getAllPosts().pipe(catchError(() => of([]))),
      reports: this.adminService.getAllReports().pipe(catchError(() => of([]))),
      stats: this.adminService.getDashboardStats().pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Create new array references to trigger change detection
          this.users = [...data.users];
          this.posts = [...data.posts];
          this.reports = [...data.reports];
          this.stats = data.stats ? { ...data.stats } : null;

          // Update tab badges
          this.updateTabBadges();

          // Calculate stats if backend doesn't provide them
          if (!this.stats) {
            this.calculateStats();
          }

          // Force change detection
          this.cdr.detectChanges();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          // Set fallback data
          this.calculateStats();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  calculateStats(): void {
    if (!this.stats) {
      this.stats = {
        totalUsers: this.users.length,
        activeUsers: this.users.filter((u) => !u.banned).length,
        bannedUsers: this.users.filter((u) => u.banned).length,
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
    this.tabs[1].badge = this.users.filter((u) => u.banned).length;
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

  // Check if user is admin
  isAdminUser(user: User): boolean {
    return user.role === 'ADMIN';
  }

  // Open ban modal
  openBanModal(user: User) {
    if (this.isAdminUser(user)) {
      alert('Cannot ban admin users');
      return;
    }
    this.selectedUser = user;
    this.banDuration = 30;
    this.banDurationUnit = 'days';
    this.banReason = '';
    this.isPermanentBan = false;
    this.showBanModal = true;
  }

  // Open delete modal
  openDeleteModal(user: User) {
    if (this.isAdminUser(user)) {
      alert('Cannot delete admin users');
      return;
    }
    this.selectedUser = user;
    this.deleteReason = '';
    this.showDeleteModal = true;
  }

  // Close modals
  closeModals() {
    this.showBanModal = false;
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  // Execute ban
  executeBan() {
    if (!this.selectedUser) return;

    this.adminService.banUser(this.selectedUser.id, this.isPermanentBan, this.banDuration, this.banDurationUnit, this.banReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('User banned:', this.selectedUser!.id);
          // Update user status immediately for better UX
          const userIndex = this.users.findIndex(u => u.id === this.selectedUser!.id);
          if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], banned: true };
            this.updateTabBadges();
            this.cdr.detectChanges();
          }
          this.closeModals();
          // Also refresh full data to ensure consistency
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          console.error('Error banning user:', error);
          alert('Error banning user: ' + (error.error || error.message || 'Unknown error'));
        },
      });
  }

  unbanUser(user: User) {
    this.adminService.unbanUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('User unbanned:', user.id);
          // Update user status immediately for better UX
          const userIndex = this.users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], banned: false };
            this.updateTabBadges();
            this.cdr.detectChanges();
          }
          // Also refresh full data to ensure consistency
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          console.error('Error unbanning user:', error);
          // You could add a toast notification here
        },
      });
  }

  // Execute delete
  executeDelete() {
    if (!this.selectedUser) return;

    this.adminService.deleteUser(this.selectedUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('User deleted:', this.selectedUser!.id);
          // Remove user from local array immediately
          this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
          this.updateTabBadges();
          this.cdr.detectChanges();
          this.closeModals();
          // Also refresh full data to ensure consistency
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user: ' + (error.error || error.message || 'Unknown error'));
        },
      });
  }

  resolveReport(report: Report) {
    this.adminService.resolveReport(report.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Report resolved:', report.id);
          // Update report status immediately for better UX
          const reportIndex = this.reports.findIndex(r => r.id === report.id);
          if (reportIndex !== -1) {
            this.reports[reportIndex] = { ...this.reports[reportIndex], status: 'RESOLVED' };
            this.updateTabBadges();
            this.cdr.detectChanges();
          }
          // Also refresh full data to ensure consistency
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          console.error('Error resolving report:', error);
          // You could add a toast notification here
        },
      });
  }

  dismissReport(report: Report) {
    this.adminService.dismissReport(report.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Report dismissed:', report.id);
          // Update report status immediately for better UX
          const reportIndex = this.reports.findIndex(r => r.id === report.id);
          if (reportIndex !== -1) {
            this.reports[reportIndex] = { ...this.reports[reportIndex], status: 'DISMISSED' };
            this.updateTabBadges();
            this.cdr.detectChanges();
          }
          // Also refresh full data to ensure consistency
          setTimeout(() => this.loadDashboardData(), 500);
        },
        error: (error) => {
          console.error('Error dismissing report:', error);
          // You could add a toast notification here
        },
      });
  }

  deletePost(post: Post) {
    if (confirm(`Are you sure you want to delete this post?`)) {
      this.adminService.deletePost(post.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Post deleted:', post.id);
            // Remove post from local array immediately
            this.posts = this.posts.filter(p => p.id !== post.id);
            this.cdr.detectChanges();
            // Also refresh full data to ensure consistency
            setTimeout(() => this.loadDashboardData(), 500);
          },
          error: (error) => {
            console.error('Error deleting post:', error);
            // You could add a toast notification here
          },
        });
    }
  }

  getTodayUsers(): number {
    return this.stats?.totalUsers ? Math.floor(this.stats.totalUsers * 0.1) : 0;
  }

  getTodayPosts(): number {
    return this.stats?.totalPosts ? Math.floor(this.stats.totalPosts * 0.2) : 0;
  }

  // Manual refresh method
  refreshData(): void {
    this.loadDashboardData();
  }

  // Getter for loading state
  get loading(): boolean {
    return this.isLoading;
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
