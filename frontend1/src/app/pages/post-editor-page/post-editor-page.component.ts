import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostDto } from '../../models/post.model';

@Component({
  selector: 'app-post-editor-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-editor-page.html',
  styleUrl: './post-editor-page.scss'
})
export class PostEditorPageComponent implements OnInit {
  protected readonly title = signal('Write Post');
  
  post: PostDto = {
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    visibility: 'public',
    media: []
  };
  
  newTag = '';
  isEditing = false;
  loading = false;
  saving = false;
  
  // Mock current user
  currentUser = {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c0a2?w=150&h=150&fit=crop&crop=face'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      if (postId) {
        this.isEditing = true;
        this.loadPost(postId);
      }
    });
  }

  private loadPost(postId: string): void {
    this.loading = true;
    
    // Simulate API call to load existing post
    setTimeout(() => {
      this.post = {
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

React Hooks make functional components more powerful and easier to work with. They promote code reuse and make the component logic more testable.`,
        excerpt: 'Learn the fundamentals of React Hooks and how they can simplify your component logic. We\'ll cover useState, useEffect, and custom hooks.',
        tags: ['react', 'javascript', 'webdev', 'hooks'],
        visibility: 'public',
        media: []
      };
      this.loading = false;
    }, 1000);
  }

  addTag(): void {
    if (this.newTag.trim() && !this.post.tags.includes(this.newTag.trim())) {
      this.post.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.post.tags = this.post.tags.filter(t => t !== tag);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.addTag();
    }
  }

  generateExcerpt(): void {
    if (this.post.content) {
      // Simple excerpt generation - take first 150 characters
      this.post.excerpt = this.post.content.substring(0, 150).trim() + '...';
    }
  }

  saveDraft(): void {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      alert('Draft saved successfully!');
    }, 1000);
  }

  publishPost(): void {
    if (!this.post.title.trim() || !this.post.content.trim()) {
      alert('Please fill in the title and content');
      return;
    }

    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      alert(this.isEditing ? 'Post updated successfully!' : 'Post published successfully!');
      this.router.navigate(['/home']);
    }, 1500);
  }

  previewPost(): void {
    // Open preview in new tab or modal
    console.log('Preview post:', this.post);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  onContentChange(): void {
    // Auto-generate excerpt if empty
    if (!this.post.excerpt && this.post.content) {
      this.generateExcerpt();
    }
  }
}
