/**
 * Centralized User model for the entire application
 * This is the single source of truth for User interface
 */

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
    followers: number;
    following: number;
    posts: number;
    banned?: boolean;
    banEnd?: string;
}

/**
 * User profile interface for detailed user information
 */
export interface UserProfile extends User {
    // Additional profile-specific fields can be added here
}

/**
 * User suggestion interface for search and suggestions
 */
export interface UserSuggestion {
    id: number;
    username: string;
    email: string;
    image: string; // Keep as 'image' for backward compatibility
    bio: string;
    role: string;
    followerCount: number; // Keep as 'followerCount' for backward compatibility
    postCount: number; // Keep as 'postCount' for backward compatibility
    suggestionScore: number;
    isFollowing?: boolean;
}

/**
 * Request interface for updating user profile
 */
export interface UpdateProfileRequest {
    username?: string;
    email?: string;
    bio?: string;
    avatar?: string;
}

/**
 * Request interface for changing user password
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * User statistics interface
 */
export interface UserStats {
    posts: number;
    followers: number;
    following: number;
    likes: number;
}

/**
 * User creation request interface
 */
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    bio?: string;
}

/**
 * User login request interface
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * User registration request interface
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    bio?: string;
}
