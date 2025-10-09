import { User } from './user.model';
import { Post } from './post.model';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'subscribe' | 'post';
  message: string;
  user: User;
  post?: Post;
  read: boolean;
  createdAt: string;
}

export interface NotificationDto {
  type: 'like' | 'comment' | 'subscribe' | 'post';
  message: string;
  userId: string;
  postId?: string;
}
