import { User } from './user.model';
import { Post } from './post.model';

/**
 * Centralized Admin model for the entire application
 * This is the single source of truth for Admin-related interfaces
 */

export interface Report {
    id: number;
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    reporter: User;
    reportedUser?: User;
    reportedPost?: Post;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: User;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    totalPosts: number;
    pendingReports: number;
    criticalReports: number;
    resolvedReports: number;
    platformHealth: number;
    newUsersThisMonth: number;
    newPostsThisMonth: number;
    topTags: { tag: string; count: number }[];
    userGrowth: { month: string; users: number }[];
    postGrowth: { month: string; posts: number }[];
}

export interface AdminAction {
    id: number;
    type: 'USER_BAN' | 'USER_UNBAN' | 'POST_DELETE' | 'REPORT_RESOLVE' | 'REPORT_DISMISS';
    targetUser?: User;
    targetPost?: Post;
    targetReport?: Report;
    admin: User;
    reason?: string;
    createdAt: string;
    expiresAt?: string;
}

export interface SystemSettings {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    maxPostsPerDay: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    maintenanceMode: boolean;
    maintenanceMessage?: string;
}

export interface UserModeration {
    userId: number;
    action: 'WARN' | 'BAN' | 'UNBAN';
    reason: string;
    duration?: number; // in days
    adminId: number;
    createdAt: string;
}

export interface ContentModeration {
    contentId: number;
    contentType: 'POST' | 'COMMENT';
    action: 'APPROVE' | 'REJECT' | 'FLAG';
    reason?: string;
    moderatorId: number;
    createdAt: string;
}
