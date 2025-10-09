import { User } from './user.model';
import { Post } from './post.model';
import { Notification } from './notification.model';

export interface AppState {
  currentUser: User | null;
  currentPage: string;
  theme: 'light' | 'dark';
  posts: Post[];
  notifications: Notification[];
  users: User[];
  selectedPost: Post | null;
  selectedUser: User | null;
  showNotifications: boolean;
  showReportModal: boolean;
  reportTarget: { type: 'post' | 'user'; id: string } | null;
  loading: boolean;
  error: string | null;
}
