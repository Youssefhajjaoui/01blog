import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/post.model';
import { User } from '../../models/user.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss'
})
export class PostDetailPageComponent implements OnInit {
  protected readonly title = signal('Post Detail');

  post: Post | null = null;
  comments: Comment[] = [];
  newComment = '';
  loading = true;
  submittingComment = false;

  // Mock current user
  currentUser: User = {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
    bio: 'Computer Science student',
    role: 'user',
    subscribers: 1234,
    posts: 42
  };

  // Mock comments
  private mockComments: Comment[] = [
    {
      id: '1',
      author: {
        id: '2',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Full-stack developer',
        role: 'user',
        subscribers: 856,
        posts: 24
      },
      content: 'Great explanation! I\'ve been struggling with hooks for a while. This really helped clarify things.',
      createdAt: '2024-01-15T12:30:00Z',
      postId: '1',
      replies: [
        {
          id: '2',
          author: this.currentUser,
          content: 'Thanks! I\'m glad it helped. Feel free to ask if you have any questions.',
          createdAt: '2024-01-15T13:00:00Z',
          postId: '1'
        }
      ]
    },
    {
      id: '3',
      author: {
        id: '3',
        name: 'Maya Patel',
        email: 'maya@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face',
        bio: 'Data Science student',
        role: 'user',
        subscribers: 1230,
        posts: 67
      },
      content: 'The useEffect examples are really helpful. I didn\'t know you could use it like that!',
      createdAt: '2024-01-15T14:15:00Z',
      postId: '1'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      this.loadPost(postId);
    });
  }

  private loadPost(postId: string): void {
    this.loading = true;

    // Simulate API call
    setTimeout(() => {
      this.post = {
        id: postId,
        author: {
          id: '2',
          name: 'Alex Rivera',
          email: 'alex@example.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Full-stack developer and CS student passionate about creating meaningful applications.',
          role: 'user',
          subscribers: 856,
          posts: 24
        },
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

## Custom Hooks

You can also create your own custom hooks to share stateful logic between components:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
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
      };

      this.comments = this.mockComments;
      this.loading = false;
    }, 1000);
  }

  likePost(): void {
    if (this.post) {
      this.post.isLiked = !this.post.isLiked;
      this.post.likes += this.post.isLiked ? 1 : -1;
    }
  }

  subscribeToAuthor(): void {
    if (this.post) {
      this.post.isSubscribed = !this.post.isSubscribed;
    }
  }

  submitComment(): void {
    if (!this.newComment.trim()) return;

    this.submittingComment = true;

    // Simulate API call
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now().toString(),
        author: this.currentUser,
        content: this.newComment,
        createdAt: new Date().toISOString(),
        postId: this.post!.id
      };

      this.comments.unshift(comment);
      this.newComment = '';
      this.submittingComment = false;

      if (this.post) {
        this.post.comments += 1;
      }
    }, 1000);
  }

  likeComment(commentId: string): void {
    // Add like functionality for comments
    console.log('Like comment:', commentId);
  }

  replyToComment(commentId: string): void {
    // Add reply functionality
    console.log('Reply to comment:', commentId);
  }

  navigateToAuthor(): void {
    if (this.post) {
      this.router.navigate(['/profile', this.post.author.id]);
    }
  }

  navigateToEditor(): void {
    if (this.post) {
      this.router.navigate(['/editor', this.post.id]);
    }
  }

  sharePost(): void {
    if (navigator.share) {
      navigator.share({
        title: this.post?.title,
        text: this.post?.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  isOwner(): boolean {
    return this.post?.author.id === this.currentUser.id;
  }
}
