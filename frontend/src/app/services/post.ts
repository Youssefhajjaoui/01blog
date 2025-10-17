import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
// import {mapBackendPostToFrontend} from '' // FIX: Provide correct path or remove if not available
// import { Post } from '../models/post.model'; // your Post interface

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  subscribers: number;
  posts: number;
}

export interface Media {
  type: string;
  url: string;
  alt: string;
}

export interface Post {
  id: string;
  author: Author;
  title: string;
  content: string;
  excerpt: string;
  media: Media[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSubscribed: boolean;
  createdAt: string;
  visibility: string;
}
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:9090/posts'; // replace with your backend URL

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}`, { withCredentials: true })
      .pipe(map((posts) => posts.map(mapBackendPostToFrontend)));
  }

  createPost(postData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, postData, { withCredentials: true });
  }

  // Optional: like, subscribe, report methods can also go here
}
function mapBackendPostToFrontend(raw: any): Post {
  return {
    id: raw.id,
    author: {
      id: String(raw.author.id),
      name: raw.author.username, // Map 'username' to 'name'
      email: raw.author.email,
      avatar: raw.author.avatar || raw.author.avatr, // Handle typo
      bio: raw.author.bio,
      role: raw.author.role,
      subscribers: raw.author.subscribers || 0,
      posts: raw.author.posts || 0,
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
