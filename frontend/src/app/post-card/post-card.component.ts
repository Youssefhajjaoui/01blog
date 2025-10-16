import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../home/home.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
})
export class AppPostCardComponent {
  @Input() post!: Post;
  @Input() variant: string = 'feed';
  @Input() currentUserId: string = '';
  @Output() like = new EventEmitter<{ postId: string }>();
  @Output() subscribe = new EventEmitter<{ userId: string }>();
  @Output() comment = new EventEmitter<{ postId: string }>();
  @Output() postClick = new EventEmitter<{ post: Post }>();
  @Output() userClick = new EventEmitter<{ userId: string }>();
  @Output() report = new EventEmitter<{ postId: string }>();

  localLiked: boolean = false;
  localSubscribed: boolean = false;
  localLikes: number = 0;
  showMenu: boolean = false;

  ngOnInit() {
    this.localLiked = this.post.isLiked;
    this.localSubscribed = this.post.isSubscribed;
    this.localLikes = this.post.likes;
  }

  get isOwner(): boolean {
    return this.post.author.id === this.currentUserId;
  }

  handleLike(event: Event) {
    event.stopPropagation();
    this.localLiked = !this.localLiked;
    this.localLikes = this.localLiked ? this.localLikes + 1 : this.localLikes - 1;
    this.like.emit({ postId: this.post.id });
  }

  handleSubscribe(event: Event) {
    event.stopPropagation();
    this.localSubscribed = !this.localSubscribed;
    this.subscribe.emit({ userId: this.post.author.id });
  }

  handleComment(event: Event) {
    event.stopPropagation();
    this.comment.emit({ postId: this.post.id });
  }

  handlePostClick() {
    this.postClick.emit({ post: this.post });
  }

  handleUserClick(event: Event) {
    event.stopPropagation();
    this.userClick.emit({ userId: this.post.author.id });
  }

  handleReport(event: Event) {
    event.stopPropagation();
    this.showMenu = false;
    this.report.emit({ postId: this.post.id });
  }

  handleShare(event: Event) {
    event.stopPropagation();
    this.showMenu = false;
    // Copy link to clipboard logic
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

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
