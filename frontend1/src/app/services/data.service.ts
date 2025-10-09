import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private postsSubject = new BehaviorSubject<Post[]>([]);
    private usersSubject = new BehaviorSubject<User[]>([]);
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);

    public posts$ = this.postsSubject.asObservable();
    public users$ = this.usersSubject.asObservable();
    public notifications$ = this.notificationsSubject.asObservable();

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        // Mock users
        const mockUsers: User[] = [
            {
                id: '1',
                name: 'Sarah Chen',
                email: 'sarah@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
                bio: 'Computer Science student sharing my coding journey and learning experiences.',
                role: 'user',
                subscribers: 1234,
                posts: 42,
                createdAt: '2023-01-15T10:30:00Z'
            },
            {
                id: '2',
                name: 'Alex Rivera',
                email: 'alex@example.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                bio: 'Full-stack developer and CS student passionate about creating meaningful applications.',
                role: 'user',
                subscribers: 856,
                posts: 24,
                createdAt: '2023-01-14T15:45:00Z'
            },
            {
                id: '3',
                name: 'Maya Patel',
                email: 'maya@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
                bio: 'Data Science student at MIT',
                role: 'user',
                subscribers: 1230,
                posts: 67,
                createdAt: '2023-01-13T09:20:00Z'
            },
            {
                id: '4',
                name: 'Jordan Kim',
                email: 'jordan@example.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                bio: 'CS Senior at Stanford, iOS enthusiast',
                role: 'user',
                subscribers: 445,
                posts: 31,
                createdAt: '2023-01-12T14:30:00Z'
            }
        ];

        // Mock posts
        const mockPosts: Post[] = [
            {
                id: '1',
                author: mockUsers[1],
                title: 'Understanding React Hooks: A Beginner\'s Guide',
                content: `# Understanding React Hooks: A Beginner's Guide

React Hooks have revolutionized how we write React components. They allow us to use state and other React features in functional components, making our code more reusable and easier to understand.

## What are React Hooks?

React Hooks are functions that let you "hook into" React state and lifecycle features from functional components. They were introduced in React 16.8 and have become the standard way to write React components.

## Basic Hooks

### useState
The useState hook allows you to add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect
The useEffect hook lets you perform side effects in functional components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Conclusion

React Hooks make functional components more powerful and easier to work with. They promote code reuse and make the component logic more testable. Start experimenting with hooks in your next React project!`,
                excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic. We\'ll cover useState, useEffect, and custom hooks.',
                media: [{
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGphdmFzY3JpcHQlMjByZWFjdHxlbnwxfHx8fDE3NTg3OTcyNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                    alt: 'React code on screen'
                }],
                tags: ['react', 'javascript', 'webdev', 'hooks'],
                likes: 142,
                comments: 28,
                isLiked: false,
                isSubscribed: false,
                createdAt: '2024-01-15T10:30:00Z',
                visibility: 'public'
            },
            {
                id: '2',
                author: mockUsers[2],
                title: 'My Journey from Zero to Machine Learning Engineer',
                content: 'Six months ago, I knew nothing about machine learning...',
                excerpt: 'A personal story about transitioning from web development to machine learning, including the resources and projects that helped me along the way.',
                media: [{
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1753613648137-602c669cbe07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwY29kaW5nJTIwY29tcHV0ZXIlMjBzY2llbmNlfGVufDF8fHx8MTc1ODc5NzI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                    alt: 'Students learning computer science'
                }],
                tags: ['machinelearning', 'python', 'career', 'journey'],
                likes: 89,
                comments: 15,
                isLiked: true,
                isSubscribed: true,
                createdAt: '2024-01-14T15:45:00Z',
                visibility: 'public'
            },
            {
                id: '3',
                author: mockUsers[3],
                title: 'Building My First iOS App: Lessons Learned',
                content: 'After months of learning Swift and iOS development...',
                excerpt: 'Key takeaways from developing my first iOS application, including common pitfalls and helpful resources for beginners.',
                media: [{
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMHR1dG9yaWFsJTIwdGVjaG5vbG9neSUyMGJsb2d8ZW58MXx8fHwxNzU4Nzk3MjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                    alt: 'Programming tutorial on screen'
                }],
                tags: ['ios', 'swift', 'mobile', 'beginner'],
                likes: 67,
                comments: 12,
                isLiked: false,
                isSubscribed: false,
                createdAt: '2024-01-13T09:20:00Z',
                visibility: 'public'
            }
        ];

        // Mock notifications
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'like',
                message: 'Alex Rivera liked your post "Understanding React Hooks"',
                user: mockUsers[1],
                post: mockPosts[0],
                read: false,
                createdAt: '2024-01-15T12:30:00Z'
            },
            {
                id: '2',
                type: 'comment',
                message: 'Maya Patel commented on your post',
                user: mockUsers[2],
                post: mockPosts[0],
                read: false,
                createdAt: '2024-01-15T11:15:00Z'
            },
            {
                id: '3',
                type: 'subscribe',
                message: 'Jordan Kim started following you',
                user: mockUsers[3],
                read: true,
                createdAt: '2024-01-14T16:20:00Z'
            }
        ];

        this.usersSubject.next(mockUsers);
        this.postsSubject.next(mockPosts);
        this.notificationsSubject.next(mockNotifications);
    }

    // Posts methods
    getPosts(): Observable<Post[]> {
        return this.posts$.pipe(delay(500));
    }

    getPostById(id: string): Observable<Post | undefined> {
        const posts = this.postsSubject.value;
        const post = posts.find(p => p.id === id);
        return of(post).pipe(delay(300));
    }

    likePost(postId: string): Observable<Post> {
        const posts = this.postsSubject.value;
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            this.postsSubject.next([...posts]);
        }
        return of(post!).pipe(delay(200));
    }

    // Users methods
    getUsers(): Observable<User[]> {
        return this.users$.pipe(delay(300));
    }

    getUserById(id: string): Observable<User | undefined> {
        const users = this.usersSubject.value;
        const user = users.find(u => u.id === id);
        return of(user).pipe(delay(200));
    }

    // Notifications methods
    getNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(delay(200));
    }

    markNotificationAsRead(notificationId: string): Observable<void> {
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.notificationsSubject.next([...notifications]);
        }
        return of(undefined).pipe(delay(100));
    }

    markAllNotificationsAsRead(): Observable<void> {
        const notifications = this.notificationsSubject.value;
        notifications.forEach(n => n.read = true);
        this.notificationsSubject.next([...notifications]);
        return of(undefined).pipe(delay(200));
    }

    // Search methods
    searchPosts(query: string): Observable<Post[]> {
        const posts = this.postsSubject.value;
        const filteredPosts = posts.filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        return of(filteredPosts).pipe(delay(300));
    }

    searchUsers(query: string): Observable<User[]> {
        const users = this.usersSubject.value;
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.bio?.toLowerCase().includes(query.toLowerCase())
        );
        return of(filteredUsers).pipe(delay(300));
    }
}
