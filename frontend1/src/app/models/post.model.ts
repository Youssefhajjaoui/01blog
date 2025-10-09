import { User } from './user.model';

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  excerpt: string;
  media?: MediaItem[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSubscribed: boolean;
  createdAt: string;
  updatedAt?: string;
  visibility: 'public' | 'private' | 'draft';
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export interface PostDto {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  visibility: 'public' | 'private' | 'draft';
  media?: MediaItem[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
  postId: string;
}

export interface CommentDto {
  content: string;
  postId: string;
  parentId?: string;
}
