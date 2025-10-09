import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() currentUserId: string = '';
  @Input() variant: 'feed' | 'grid' | 'compact' = 'feed';
  
  @Output() onLike = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  @Output() onComment = new EventEmitter<string>();
  @Output() onPostClick = new EventEmitter<Post>();
  @Output() onUserClick = new EventEmitter<string>();
  @Output() onReport = new EventEmitter<string>();

  protected readonly title = signal('Post Card');

  isOwner(): boolean {
    return this.post.author.id === this.currentUserId;
  }

  handleLike(event: Event): void {
    event.stopPropagation();
    this.onLike.emit(this.post.id);
  }

  handleSubscribe(event: Event): void {
    event.stopPropagation();
    this.onSubscribe.emit(this.post.author.id);
  }

  handleComment(event: Event): void {
    event.stopPropagation();
    this.onComment.emit(this.post.id);
  }

  handlePostClick(): void {
    this.onPostClick.emit(this.post);
  }

  handleUserClick(event: Event): void {
    event.stopPropagation();
    this.onUserClick.emit(this.post.author.id);
  }

  handleReport(event: Event): void {
    event.stopPropagation();
    this.onReport.emit(this.post.id);
  }

  handleShare(event: Event): void {
    event.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: this.post.title,
        text: this.post.excerpt,
        url: `${window.location.origin}/post/${this.post.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${this.post.id}`);
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
}
