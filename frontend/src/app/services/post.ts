import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { withCredentials: true }).pipe(
      map((posts: any) =>
        posts.map((p: any) => ({
          id: String(p.id),
          author: {
            id: String(p.creator.id),
            name: p.creator.username,
            email: p.creator.email,
            avatar: p.creator.image || '',
            bio: '',
            role: p.creator.role,
            subscribers: 0,
            posts: 0,
          },
          title: p.title,
          content: p.content,
          excerpt: p.content.slice(0, 100), // optional
          media: p.mediaUrl ? [{ type: p.mediaType || 'image', url: p.mediaUrl, alt: '' }] : [],
          tags: [],
          likes: 0,
          comments: 0,
          isLiked: false,
          isSubscribed: false,
          createdAt: p.createdAt,
          visibility: 'public',
        }))
      )
    );
  }

  // Optional: like, subscribe, report methods can also go here
}
