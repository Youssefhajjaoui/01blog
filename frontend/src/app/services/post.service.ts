import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout, catchError, of } from 'rxjs';
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
  private apiUrl = 'http://localhost:9090'; // replace with your backend URL

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/posts`, { withCredentials: true })
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
    return this.http.get<Post>(`${this.apiUrl}/posts/${postId}`, { withCredentials: true });
  }

  likePost(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/likes/post/${postId}`, {}, { withCredentials: true });
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/likes/post/${postId}`, { withCredentials: true });
  }

  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/post/${postId}`, { withCredentials: true });
  }

  createComment(commentData: CreateCommentRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comments/post/${commentData.postId}`, {
      content: commentData.content
    }, {
      withCredentials: true,
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, { withCredentials: true });
  }

  updateComment(commentId: number, updateData: { content: string }): Observable<any> {
    console.log('PostService: Updating comment', commentId, 'with data:', updateData);
    console.log('PostService: Making PUT request to:', `${this.apiUrl}/comments/${commentId}`);

    return this.http.put<any>(`${this.apiUrl}/comments/${commentId}`, updateData, {
      withCredentials: true
    }).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('PostService: Update comment error:', error);
        console.error('PostService: Error status:', error.status);
        console.error('PostService: Error message:', error.message);
        console.error('PostService: Error body:', error.error);
        throw error;
      })
    );
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post<any>('http://localhost:9090/api/files/upload', formData, {
      withCredentials: true,
    });
  }

  reportPost(reportData: { postId: number; reason: string; details: string }): Observable<any> {
    return this.http.post<any>(
      `http://localhost:9090/reports/posts/${reportData.postId}`,
      {
        reason: reportData.reason,
        description: reportData.details,
      },
      { withCredentials: true }
    );
  }
}
function mapBackendPostToFrontend(raw: any): Post {
  return {
    id: raw.id,
    author: {
      id: raw.author.id, // Keep as number
      username: raw.author.username, // Use username instead of name
      email: raw.author.email,
      avatar: raw.author.avatar || raw.author.avatr, // Handle typo
      bio: raw.author.bio,
      role: raw.author.role,
      followers: raw.author.followers || 0,
      following: raw.author.following || 0,
      posts: raw.author.posts || 0,
      createdAt: raw.author.createdAt || new Date().toISOString(),
    },
    title: raw.title,
    content: raw.content,
    excerpt: raw.excerpt,
    media: raw.media,
    tags: raw.tags,
    likes: raw.likes,
    comments: raw.comments,
    isLiked: raw.liked,
    isSubscribed: raw.subscribed,
    createdAt: raw.createdAt,
    visibility: raw.visibility,
  };
}
