import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout, catchError, of } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import {
  Post,
  Media,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  CreateCommentRequest,
} from '../models';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl: string;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    // Use different API URL based on where code is running
    this.apiUrl = isPlatformServer(this.platformId)
      ? 'http://gateway:8080/api'  // Server-side (SSR in Docker)
      : 'http://localhost:8080/api'; // Client-side (browser)
  }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/posts`, { withCredentials: true })
      .pipe(map((posts) => posts.map(mapBackendPostToFrontend)));
  }

  getPostsByUser(userId: number): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/posts/user/${userId}`, { withCredentials: true })
      .pipe(map((posts) => posts.map(mapBackendPostToFrontend)));
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, postData, { withCredentials: true });
  }

  updatePost(postId: number, postData: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(
      `${this.apiUrl}/posts/${postId}`,
      {
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        mediaUrl: postData.mediaUrl,
        mediaType: postData.mediaType,
      },
      { withCredentials: true }
    );
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`, { withCredentials: true });
  }

  getPost(postId: number): Observable<Post> {
    return this.http
      .get<any>(`${this.apiUrl}/posts/${postId}`, { withCredentials: true })
      .pipe(map(mapBackendPostToFrontend));
  }

  getPostById(postId: number): Observable<Post> {
    return this.getPost(postId);
  }

  likePost(postId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/likes/post/${postId}`,
      {},
      { withCredentials: true }
    );
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/likes/post/${postId}`, { withCredentials: true });
  }

  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/post/${postId}`, {
      withCredentials: true,
    });
  }

  createComment(commentData: CreateCommentRequest): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/comments/post/${commentData.postId}`,
      {
        content: commentData.content,
      },
      {
        withCredentials: true,
      }
    );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, {
      withCredentials: true,
    });
  }

  updateComment(commentId: number, updateData: { content: string }): Observable<any> {
    console.log('PostService: Updating comment', commentId, 'with data:', updateData);
    console.log('PostService: Making PUT request to:', `${this.apiUrl}/comments/${commentId}`);

    return this.http
      .put<any>(`${this.apiUrl}/comments/${commentId}`, updateData, {
        withCredentials: true,
      })
      .pipe(
        timeout(10000), // 10 second timeout
        catchError((error) => {
          console.error('PostService: Update comment error:', error);
          console.error('PostService: Error status:', error.status);
          console.error('PostService: Error message:', error.message);
          console.error('PostService: Error body:', error.error);
          throw error;
        })
      );
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/files/upload', formData, {
      withCredentials: true,
    });
  }

  reportPost(reportData: { postId: number; reason: string; details: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/reports/posts/${reportData.postId}`,
      {
        reason: reportData.reason,
        description: reportData.details,
      },
      { withCredentials: true }
    );
  }

  getTrending(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts/tags`, { withCredentials: true });
  }
  // In your Angular service
  connectToNotifications(): EventSource {
    return new EventSource('http://localhost:8080/api/sse/notifications', {
      withCredentials: true, // Important for JWT cookies
    });
  }
}
function mapBackendPostToFrontend(raw: any): Post {
  // Handle both 'author' and 'creator' field names from backend
  const authorData = raw.author || raw.creator;

  if (!authorData) {
    console.error('Post missing author/creator data:', raw);
    throw new Error('Post data is missing author information');
  }

  return {
    id: raw.id,
    author: {
      id: authorData.id, // Keep as number
      username: authorData.username, // Use username instead of name
      email: authorData.email || '',
      avatar: authorData.avatar || authorData.image || authorData.avatr, // Handle typo and different field names
      bio: authorData.bio || '',
      role: authorData.role || 'USER',
      followers: authorData.followers || 0,
      following: authorData.following || 0,
      posts: authorData.posts || 0,
      createdAt: authorData.createdAt || new Date().toISOString(),
    },
    title: raw.title,
    content: raw.content,
    excerpt: raw.excerpt || raw.content?.substring(0, 200),
    media: raw.media,
    mediaUrl: raw.mediaUrl,
    mediaType: raw.mediaType,
    tags: raw.tags || [],
    likes: raw.likes || 0,
    comments: raw.comments || 0,
    isLiked: raw.liked || false,
    isSubscribed: raw.subscribed || false,
    createdAt: raw.createdAt,
    visibility: raw.visibility || 'PUBLIC',
    hidden: raw.hidden || false,
    hideReason: raw.hideReason,
  };
}
