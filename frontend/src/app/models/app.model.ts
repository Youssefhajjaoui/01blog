import { User } from './user.model';
import { Post } from './post.model';

/**
 * Centralized App model for the entire application
 * This is the single source of truth for App-related interfaces
 */

export interface AppState {
    currentUser?: User | null;
    posts?: Post[];
    users?: User[];
    showReportModal?: boolean;
    reportTarget?: { type: string; id: number };
    isLoading?: boolean;
    error?: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    query: string;
    filters?: any;
}

export interface Notification {
    id: number;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'SYSTEM';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    userId: number;
    relatedUserId?: number;
    relatedPostId?: number;
    actionUrl?: string;
}

export interface TrendingTag {
    tag: string;
    count: number;
    growth?: number;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    postCount: number;
}

export interface Theme {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    isDark: boolean;
}

export interface Settings {
    theme: Theme;
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        likes: boolean;
        comments: boolean;
        follows: boolean;
        mentions: boolean;
    };
    privacy: {
        profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
        showEmail: boolean;
        showFollowers: boolean;
        showFollowing: boolean;
    };
}
