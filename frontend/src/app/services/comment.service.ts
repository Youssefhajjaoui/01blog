import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest } from '../models';
import { isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class CommentService {
    private apiUrl: string;
    private readonly platformId = inject(PLATFORM_ID);

    constructor(private http: HttpClient) {
        this.apiUrl = isPlatformServer(this.platformId) ? 'http://gateway:8080' : 'http://localhost:8080';
    }

    getComments(postId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/comments/post/${postId}`, {
            withCredentials: true,
        });
    }

    createComment(commentData: CreateCommentRequest): Observable<Comment> {
        return this.http.post<Comment>(
            `${this.apiUrl}/comments/post/${commentData.postId}`,
            {
                content: commentData.content,
            },
            {
                withCredentials: true,
            }
        );
    }

    updateComment(commentId: number, updateData: { content: string }): Observable<Comment> {
        return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, updateData, {
            withCredentials: true,
        });
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`, {
            withCredentials: true,
        });
    }

    likeComment(commentId: number): Observable<void> {
        return this.http.post<void>(
            `${this.apiUrl}/likes/comment/${commentId}`,
            {},
            {
                withCredentials: true,
            }
        );
    }

    unlikeComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/likes/comment/${commentId}`, {
            withCredentials: true,
        });
    }
}

