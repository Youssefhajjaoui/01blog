import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() variant: 'feed' | 'grid' | 'compact' = 'feed';
  @Input() showActions: boolean = true;
  @Input() currentUserId: string | null = null;

  @Output() like = new EventEmitter<string>();
  @Output() comment = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();
  @Output() save = new EventEmitter<string>();
  @Output() report = new EventEmitter<string>();
  @Output() subscribe = new EventEmitter<string>();
  @Output() postClick = new EventEmitter<Post>();
  @Output() userClick = new EventEmitter<string>();

  onLike(): void {
    this.like.emit(this.post.id);
  }

  onComment(): void {
    this.comment.emit(this.post.id);
  }

  onShare(): void {
    this.share.emit(this.post.id);
  }

  onSave(): void {
    this.save.emit(this.post.id);
  }

  onReport(): void {
    this.report.emit(this.post.id);
  }

  onSubscribe(): void {
    this.subscribe.emit(this.post.author.id);
  }

  onPostClick(): void {
    this.postClick.emit(this.post);
  }

  handlePostClick(): void {
    this.postClick.emit(this.post);
  }

  onUserClick(): void {
    this.userClick.emit(this.post.author.id);
  }

  handleUserClick(event: Event): void {
    event.stopPropagation();
    this.userClick.emit(this.post.author.id);
  }

  handleLike(event: Event): void {
    event.stopPropagation();
    this.like.emit(this.post.id);
  }

  handleComment(event: Event): void {
    event.stopPropagation();
    this.comment.emit(this.post.id);
  }

  handleShare(event: Event): void {
    event.stopPropagation();
    this.share.emit(this.post.id);
  }

  handleSubscribe(event: Event): void {
    event.stopPropagation();
    this.subscribe.emit(this.post.author.id);
  }

  handleReport(event: Event): void {
    event.stopPropagation();
    this.report.emit(this.post.id);
  }

  isOwner(): boolean {
    return this.currentUserId === this.post.author.id;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  get isOwnPost(): boolean {
    return this.currentUserId === this.post.author.id;
  }
}