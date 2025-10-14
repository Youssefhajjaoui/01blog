import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../home/home.component';
@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl : './post-card.component.html',
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
}
