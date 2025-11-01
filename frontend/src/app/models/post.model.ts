import { User } from './user.model';

/**
 * Centralized Post model for the entire application
 * This is the single source of truth for Post interface
 */

export interface Media {
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  url: string;
  alt?: string;
  thumbnail?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  media?: Media[];
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSubscribed: boolean;
  createdAt: string;
  updatedAt?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  hidden?: boolean;
  hideReason?: string;
}

/**
 * Post creation request interface
 */
export interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
  media?: File[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
}

/**
 * Post update request interface
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
}

/**
 * Post comment interface
 */
export interface Comment {
  id: number;
  content: string;
  author: User;
  postId: number;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  parentId?: number;
}

/**
 * Comment creation request interface
 */
export interface CreateCommentRequest {
  content: string;
  postId: number;
  parentId?: number;
}

/**
 * Post like interface
 */
export interface PostLike {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
}

/**
 * Post report interface
 */
export interface PostReport {
  id: number;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reporter: User;
  reportedPost: Post;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: User;
}

/**
 * Post statistics interface
 */
export interface PostStats {
  likes: number;
  comments: number;
  views: number;
  shares: number;
}

/**
 * Post filter options interface
 */
export interface PostFilter {
  authorId?: number;
  tags?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Post sort options interface
 */
export interface PostSort {
  field: 'createdAt' | 'likes' | 'comments' | 'title';
  direction: 'ASC' | 'DESC';
}

/**
 * Paginated posts response interface
 */
export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
