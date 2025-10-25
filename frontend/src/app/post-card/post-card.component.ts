import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post, User, Comment, CreateCommentRequest } from '../models';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css'],
})
export class AppPostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() variant: string = 'feed';
  @Input() showExcerpt: boolean = false;
  @Input()
  currentUser!: User | null;
  @Output() deleted = new EventEmitter<number>();
  @Output() updated = new EventEmitter<Post>();
  @Output() like = new EventEmitter<{ postId: number }>();
  @Output() subscribe = new EventEmitter<{ userId: number }>();
  @Output() comment = new EventEmitter<{ postId: number }>();
  @Output() postClick = new EventEmitter<{ post: Post }>();
  @Output() userClick = new EventEmitter<{ userId: number }>();
  @Output() report = new EventEmitter<{ postId: number }>();

  // ✨ Convert all state to signals
  localLiked = signal(false);
  localSubscribed = signal(false);
  localLikes = signal(0);
  showMenu = signal(false);
  editMode = signal(false);
  editablePost = signal<any>({});
  uploadingMedia = signal(false);
  uploadError = signal('');
  originalMediaUrl = signal('');
  originalMediaType = signal<'IMAGE' | 'VIDEO' | 'AUDIO' | null>(null);
  showReportModal = signal(false);
  selectedReason = signal('');
  reportDetails = signal('');
  submittingReport = signal(false);

  // Comment modal properties
  showCommentModal = signal(false);
  comments = signal<Comment[]>([]);
  loadingComments = signal(false);
  newCommentContent = signal('');
  submittingComment = signal(false);
  commentError = signal('');

  // Comment editing properties
  editingCommentId = signal<number | null>(null);
  editingCommentContent = signal('');
  updatingComment = signal(false);

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private userService: UserService
  ) { }

  reportReasons = [
    {
      value: 'SPAM',
      label: 'Spam',
      description: 'Repetitive or promotional content',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>',
    },
    {
      value: 'HARASSMENT',
      label: 'Harassment or Bullying',
      description: 'Targeting or attacking someone',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>',
    },
    {
      value: 'HATE_SPEECH',
      label: 'Hate Speech',
      description: 'Discriminatory or offensive language',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>',
    },
    {
      value: 'FALSE_INFORMATION',
      label: 'False Information',
      description: 'Misleading or untrue content',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    },
    {
      value: 'VIOLENCE',
      label: 'Violence or Dangerous Content',
      description: 'Threatening or harmful content',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    },
    {
      value: 'INAPPROPRIATE',
      label: 'Inappropriate Content',
      description: 'Sexually explicit or offensive material',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>',
    },
    {
      value: 'OTHER',
      label: 'Other',
      description: 'Something else',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    },
  ];

  ngOnInit() {
    this.localLiked.set(this.post.isLiked);
    this.localSubscribed.set(this.post.isSubscribed);
    this.localLikes.set(this.post.likes);
    this.currentUser = this.authService.getCurrentUser();
  }

  get isOwner(): boolean {
    return this.post.author.id === this.currentUser?.id;
  }

  getDisplayContent(): string {
    if (!this.showExcerpt) {
      return this.post.content;
    }

    // Show first 200 characters as excerpt
    const maxLength = 200;
    if (this.post.content.length <= maxLength) {
      return this.post.content;
    }

    return this.post.content.substring(0, maxLength) + '...';
  }

  handleEdit(event: Event) {
    event.stopPropagation();
    this.editablePost.set({ ...this.post }); // clone current post
    // Store original media URL and type
    this.originalMediaUrl.set(this.post.mediaUrl || '');
    this.originalMediaType.set(this.post.mediaType || null);
    this.editMode.set(true);
  }

  // Helper methods for updating editable post fields
  updateEditableTitle(title: string) {
    this.editablePost.update(p => ({ ...p, title }));
  }

  updateEditableContent(content: string) {
    this.editablePost.update(p => ({ ...p, content }));
  }

  cancelEdit(event: Event) {
    event.stopPropagation();
    this.editMode.set(false);
    this.uploadError.set('');
  }

  keepOriginalMedia(event: Event) {
    event.stopPropagation();
    // Restore original media
    this.editablePost.update(post => ({
      ...post,
      mediaUrl: this.originalMediaUrl(),
      mediaType: this.originalMediaType()
    }));
    this.uploadError.set('');
    // ✨ No more detectChanges - signals auto-update!
  }

  removeAllMedia(event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove all media from this post?')) {
      this.editablePost.update(post => ({
        ...post,
        mediaUrl: '',
        mediaType: null
      }));
      this.uploadError.set('');
    }
  }

  removeNewMedia(event: Event) {
    event.stopPropagation();
    // Restore original media (or empty if there was no original)
    this.editablePost.update(post => ({
      ...post,
      mediaUrl: this.originalMediaUrl(),
      mediaType: this.originalMediaType()
    }));
    this.uploadError.set('');
  }

  onFileSelected(event: any) {
    event.stopPropagation();
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.uploadError.set('File size must be less than 10MB');
      return;
    }

    // Determine media type
    let mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | null = null;
    if (file.type.startsWith('image/')) {
      mediaType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'AUDIO';
    } else {
      this.uploadError.set('Invalid file type. Please upload an image, video, or audio file.');
      return;
    }

    // Upload the file
    this.uploadingMedia.set(true);
    this.uploadError.set('');

    const formData = new FormData();
    formData.append('file', file);

    // Use the file upload service
    this.postService.uploadFile(formData).subscribe({
      next: (response: any) => {
        this.uploadingMedia.set(false);
        // Update editable post with new media URL
        const mediaUrl = response.url || `http://localhost:9090/api/files/uploads/${response.filename}`;
        this.editablePost.update(post => ({
          ...post,
          mediaUrl,
          mediaType
        }));
        this.uploadError.set('');
        console.log('File uploaded successfully:', response);
        // ✨ No more detectChanges!
      },
      error: (err: any) => {
        this.uploadingMedia.set(false);
        this.uploadError.set(err.error?.error || 'Upload failed. Please try again.');
        console.error('Upload error:', err);
      },
    });

    // Clear the file input
    event.target.value = '';
  }

  saveEdit(event: Event) {
    event.stopPropagation();

    // Create update request with only the fields that can be updated
    const editedPost = this.editablePost();
    const updateRequest = {
      title: editedPost.title,
      content: editedPost.content,
      tags: editedPost.tags,
      mediaUrl: editedPost.mediaUrl,
      mediaType: editedPost.mediaType,
    };

    this.postService.updatePost(this.post.id, updateRequest).subscribe({
      next: (updated) => {
        // Update the post with the new data from the server
        this.post = {
          ...this.post,
          title: updated.title,
          content: updated.content,
          tags: updated.tags,
          mediaUrl: updated.mediaUrl,
          mediaType: updated.mediaType,
          updatedAt: updated.updatedAt,
        };

        // Update the excerpt if it's derived from content
        this.post.excerpt = updated.content ? updated.content.substring(0, 150) + '...' : '';

        this.editMode.set(false);
        this.showMenu.set(false);

        // ✨ No more detectChanges - signals auto-update!

        // Emit the updated post to parent component
        this.updated.emit(this.post);

        console.log('Post updated successfully:', this.post);
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Could not update post');
      },
    });
  }

  handleLike(event: Event) {
    event.stopPropagation();

    // Optimistic UI update
    const previousLiked = this.localLiked();
    const previousLikes = this.localLikes();

    // Toggle immediately for UX
    this.localLiked.update(v => !v);
    this.localLikes.update(count => this.localLiked() ? count + 1 : count - 1);

    // Call backend
    const like$ = this.localLiked()
      ? this.postService.likePost(this.post.id)
      : this.postService.unlikePost(this.post.id);

    like$.subscribe({
      next: () => {
        // success, nothing else to do
        this.like.emit({ postId: this.post.id });
      },
      error: (err) => {
        console.error('Failed to toggle like', err);
        // Revert UI if backend fails
        this.localLiked.set(previousLiked);
        this.localLikes.set(previousLikes);
      },
    });
  }

  handleSubscribe(event: Event) {
    event.stopPropagation();
    console.warn(this.localSubscribed());
    if (this.localSubscribed()) {
      this.userService.unfollowUser(this.post.author.id).subscribe({
        next: () => {
          this.localSubscribed.set(false);
          this.subscribe.emit({ userId: this.post.author.id });
        },
        error: (error) => {
          console.error('Error unfollowing user:', error);
          // Revert the UI state on error
          this.localSubscribed.set(true);
        }
      });
    } else {
      this.userService.followUser(this.post.author.id).subscribe({
        next: () => {
          this.localSubscribed.set(true);
          this.subscribe.emit({ userId: this.post.author.id });
        },
        error: (error) => {
          console.error('Error following user:', error);
          // Revert the UI state on error
          this.localSubscribed.set(false);
        }
      });
    }
  }

  handleComment(event: Event) {
    event.stopPropagation();
    this.showCommentModal.set(true);
    this.loadComments();
  }

  handlePostClick() {
    this.postClick.emit({ post: this.post });
  }

  handleDelete(event: Event) {
    event.stopPropagation();
    console.log('Delete clicked for post:', this.post?.id);

    if (!this.post?.id) {
      console.warn('No post id found');
      return;
    }

    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        console.warn('deleted', this.post.id);
        this.deleted.emit(this.post.id);
      },
      error: (err) => console.error('Delete failed:', err),
    });
  }

  handleUserClick(event: Event) {
    event.stopPropagation();
    this.userClick.emit({ userId: this.post.author.id });
  }

  handleReport(event: Event) {
    event.stopPropagation();
    this.showMenu.set(false);
    this.showReportModal.set(true);
  }

  closeReportModal(event: Event) {
    event.stopPropagation();
    this.showReportModal.set(false);
    this.selectedReason.set('');
    this.reportDetails.set('');
  }

  submitReport(event: Event) {
    event.stopPropagation();

    if (!this.selectedReason()) {
      return;
    }

    this.submittingReport.set(true);

    // Create report data
    const reportData = {
      postId: this.post.id,
      reason: this.selectedReason(),
      details: this.reportDetails(),
    };

    // Call the API to submit the report
    this.postService.reportPost(reportData).subscribe({
      next: (response) => {
        this.submittingReport.set(false);
        this.showReportModal.set(false);
        this.selectedReason.set('');
        this.reportDetails.set('');
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
        console.log('Report submitted:', response);
        // ✨ No more detectChanges!
      },
      error: (err) => {
        this.submittingReport.set(false);
        console.error('Failed to submit report:', err);
        alert('Failed to submit report. Please try again.');
      },
    });
  }

  // Comment modal methods
  closeCommentModal(event: Event) {
    event.stopPropagation();
    this.showCommentModal.set(false);
    this.newCommentContent.set('');
    this.commentError.set('');
  }

  loadComments() {
    this.loadingComments.set(true);
    this.commentError.set('');

    this.postService.getComments(this.post.id).subscribe({
      next: (response: any[]) => {
        // Map the response to match the Comment interface
        const mappedComments = response.map((commentData) => ({
          id: commentData.id,
          content: commentData.content,
          author: commentData.author,
          postId: this.post.id,
          createdAt: commentData.createdAt,
          updatedAt: commentData.createdAt,
          likes: 0, // Default values since backend doesn't provide these
          isLiked: false,
          replies: [],
          parentId: undefined,
        }));

        this.comments.set(mappedComments);
        this.loadingComments.set(false);
        // ✨ No more detectChanges!
      },
      error: (err: any) => {
        this.loadingComments.set(false);
        this.commentError.set('Failed to load comments. Please try again.');
        console.error('Failed to load comments:', err);
      },
    });
  }

  submitComment(event: Event) {
    event.stopPropagation();

    if (!this.newCommentContent().trim()) {
      this.commentError.set('Please enter a comment.');
      return;
    }

    this.submittingComment.set(true);
    this.commentError.set('');

    const commentRequest: CreateCommentRequest = {
      content: this.newCommentContent().trim(),
      postId: this.post.id,
    };

    this.postService.createComment(commentRequest).subscribe({
      next: (response: any) => {
        this.submittingComment.set(false);
        this.newCommentContent.set('');

        // Map the response to match the Comment interface
        const newComment: Comment = {
          id: response.id,
          content: response.content,
          author: response.author,
          postId: this.post.id,
          createdAt: response.createdAt,
          updatedAt: response.createdAt,
          likes: 0,
          isLiked: false,
          replies: [],
          parentId: undefined,
        };

        this.comments.update(comments => [newComment, ...comments]); // Add to beginning of array
        console.log('Comment created successfully:', response);
        // ✨ No more detectChanges!
      },
      error: (err: any) => {
        this.submittingComment.set(false);
        this.commentError.set('Failed to submit comment. Please try again.');
        console.error('Failed to create comment:', err);
      },
    });
  }

  deleteComment(commentId: number, event: Event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(comments => comments.filter((c) => c.id !== commentId));
        console.log('Comment deleted successfully');
        // ✨ No more detectChanges!
      },
      error: (err) => {
        console.error('Failed to delete comment:', err);
        alert('Failed to delete comment. Please try again.');
      },
    });
  }

  isCommentOwner(comment: Comment): boolean {
    return comment.author.id === this.currentUser?.id;
  }

  startEditComment(comment: Comment, event: Event) {
    event.stopPropagation();
    this.editingCommentId.set(comment.id);
    this.editingCommentContent.set(comment.content);
    this.commentError.set('');
  }

  cancelEditComment(event: Event) {
    event.stopPropagation();
    this.editingCommentId.set(null);
    this.editingCommentContent.set('');
    this.commentError.set('');
  }

  updateComment(event: Event) {
    event.stopPropagation();

    if (!this.editingCommentContent().trim()) {
      this.commentError.set('Please enter a comment.');
      return;
    }

    const commentId = this.editingCommentId();
    if (!commentId) {
      return;
    }

    this.updatingComment.set(true);
    this.commentError.set('');

    const updateData = {
      content: this.editingCommentContent().trim(),
    };

    console.log('Updating comment:', commentId, 'with data:', updateData);

    this.postService.updateComment(commentId, updateData).subscribe({
      next: (response: any) => {
        console.log('Update response received:', response);

        this.updatingComment.set(false);
        this.editingCommentId.set(null);
        this.editingCommentContent.set('');

        // Check if response has the expected structure
        if (!response || !response.id) {
          console.error('Invalid response structure:', response);
          this.commentError.set('Invalid response from server.');
          return;
        }

        // Update the comment in the comments array
        this.comments.update(comments => {
          const index = comments.findIndex((c) => c.id === response.id);
          if (index !== -1) {
            // Map the response to match the Comment interface
            const updatedComment: Comment = {
              id: response.id,
              content: response.content,
              author: response.author,
              postId: this.post.id,
              createdAt: response.createdAt,
              updatedAt: response.createdAt, // Use createdAt as updatedAt since backend doesn't provide updatedAt
              likes: comments[index].likes || 0, // Preserve existing likes
              isLiked: comments[index].isLiked || false, // Preserve existing like status
              replies: comments[index].replies || [],
              parentId: comments[index].parentId,
            };

            const newComments = [...comments];
            newComments[index] = updatedComment;
            console.log('Comment updated in UI:', updatedComment);
            return newComments;
          }
          console.error('Comment not found in comments array:', response.id);
          return comments;
        });

        console.log('Comment updated successfully:', response);
      },
      error: (err: any) => {
        console.error('Update error:', err);

        this.updatingComment.set(false);

        // Check if it's a JSON parsing error
        if (err.message && err.message.includes('JSON')) {
          this.commentError.set('Server returned invalid data. Please try again.');
        } else {
          this.commentError.set('Failed to update comment. Please try again.');
        }

        console.error('Failed to update comment:', err);
      },
    });
  }

  handleShare(event: Event) {
    event.stopPropagation();
    this.showMenu.set(false);
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

  getAvatarUrl(avatar: string): string {
    if (!avatar) return '';

    // If avatar is already a full URL, return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }

    // If avatar is just a filename, construct the full URL
    const filename = avatar.split('/').pop();
    return `http://localhost:9090/api/files/uploads/${filename}`;
  }
}
