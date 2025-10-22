/**
 * Centralized models index file
 * Export all models from a single location
 */

// User models
export * from './user.model';

// Post models
export * from './post.model';

// Admin models
export * from './admin.model';

// App models
export * from './app.model';

// Re-export commonly used types for convenience
export type { User, UserProfile, UserSuggestion, UpdateProfileRequest, ChangePasswordRequest } from './user.model';
export type { Post, Media, Comment, CreatePostRequest, UpdatePostRequest } from './post.model';
export type { Report, DashboardStats, AdminAction } from './admin.model';
export type { AppState, ApiResponse, PaginatedResponse, Notification } from './app.model';
