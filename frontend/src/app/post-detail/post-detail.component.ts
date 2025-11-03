import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AdminService } from '../services/admin.service';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { Post, User, Comment, CreateCommentRequest } from '../models';
import { NotificationService as UINotificationService } from '../services/ui-notification.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  currentUser: User | null = null;
  loading = false;
  loadingComments = false;
  newCommentContent = '';
  submittingComment = false;
  editingCommentId: number | null = null;
  editingCommentContent = '';
  updatingComment = false;

  // Menu and edit state
  showMenu = signal(false);
  editMode = signal(false);
  editablePost = signal<any>({});
  uploadingMedia = signal(false);
  uploadError = signal('');
  originalMediaUrl = signal('');
  originalMediaType = signal<'IMAGE' | 'VIDEO' | 'AUDIO' | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
    private notificationService: UINotificationService
  ) { }

  ngOnInit() {
    // Get current user
    this.userService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.cd.detectChanges();
    });

    // Get post ID from route
    this.route.paramMap.subscribe((params) => {
      const postId = params.get('id');
      if (postId) {
        this.loadPost(+postId);
        this.loadComments(+postId);
      }
    });
  }

  loadPost(postId: number) {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.cd.detectChanges();
    });

    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading post:', error);
        this.loading = false;
        this.cd.detectChanges();
        this.notificationService.error('Error loading post');
        this.router.navigate(['/']);
      },
    });
  }

  loadComments(postId: number) {
    this.loadingComments = true;
    this.commentService.getComments(postId).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
        this.loadingComments = false;
        this.cd.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
        this.loadingComments = false;
      },
    });
  }

  get isOwner(): boolean {
    return this.post?.author.id === this.currentUser?.id;
  }

  get isAdmin(): boolean {
    console.warn(this.currentUser?.role);
    return this.currentUser?.role === 'ADMIN';
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
        console.warn('deleted', this.post?.id);
        // this.deleted.emit(this.post.id);
        this.router.navigateByUrl('/');
      },
      error: (err) => console.error('Delete failed:', err),
    });
  }

  handleLike() {
    if (!this.post) return;

    const wasLiked = this.post.isLiked;
    const postId = this.post.id;

    // Optimistic update
    this.post = {
      ...this.post,
      isLiked: !wasLiked,
      likes: wasLiked ? this.post.likes - 1 : this.post.likes + 1,
    };
    this.cd.detectChanges();

    // Make API call
    const apiCall = wasLiked
      ? this.postService.unlikePost(postId)
      : this.postService.likePost(postId);

    apiCall.subscribe({
      next: () => {
        // Success - UI already updated
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        // Revert on error
        if (this.post) {
          this.post = {
            ...this.post,
            isLiked: wasLiked,
            likes: wasLiked ? this.post.likes + 1 : this.post.likes - 1,
          };
          this.cd.detectChanges();
        }
        this.notificationService.error('Error updating like');
      },
    });
  }

  handleSubscribe() {
    if (!this.post) return;

    const authorId = this.post.author.id;
    const wasSubscribed = this.post.isSubscribed;

    // Optimistic update
    this.post = { ...this.post, isSubscribed: !wasSubscribed };
    this.cd.detectChanges();

    // Make API call
    const apiCall = wasSubscribed
      ? this.userService.unfollowUser(authorId)
      : this.userService.followUser(authorId);

    apiCall.subscribe({
      next: () => {
        this.notificationService.success(
          wasSubscribed ? 'Unfollowed successfully' : 'Followed successfully'
        );
      },
      error: (error) => {
        console.error('Error toggling follow:', error);
        // Revert on error
        if (this.post) {
          this.post = { ...this.post, isSubscribed: wasSubscribed };
          this.cd.detectChanges();
        }
        this.notificationService.error('Error updating follow status');
      },
    });
  }

  submitComment() {
    if (!this.post || !this.newCommentContent.trim()) return;

    this.submittingComment = true;
    const commentRequest: CreateCommentRequest = {
      content: this.newCommentContent,
      postId: this.post.id,
    };

    this.commentService.createComment(commentRequest).subscribe({
      next: (comment: Comment) => {
        this.comments.unshift(comment);
        this.newCommentContent = '';
        this.submittingComment = false;
        if (this.post) {
          this.post = { ...this.post, comments: this.post.comments + 1 };
        }
        this.cd.detectChanges();
        this.notificationService.success('Comment added');
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
        this.submittingComment = false;
        this.notificationService.error('Error adding comment');
      },
    });
  }

  startEditComment(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editingCommentContent = comment.content;
  }

  cancelEditComment() {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  updateComment(commentId: number) {
    if (!this.editingCommentContent.trim()) return;

    this.updatingComment = true;
    this.commentService
      .updateComment(commentId, { content: this.editingCommentContent })
      .subscribe({
        next: (updatedComment: Comment) => {
          const index = this.comments.findIndex((c) => c.id === commentId);
          if (index !== -1) {
            this.comments[index] = updatedComment;
          }
          this.editingCommentId = null;
          this.editingCommentContent = '';
          this.updatingComment = false;
          this.cd.detectChanges();
          this.notificationService.success('Comment updated');
        },
        error: (error: any) => {
          console.error('Error updating comment:', error);
          this.updatingComment = false;
          this.notificationService.error('Error updating comment');
        },
      });
  }

  deleteComment(commentId: number) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c.id !== commentId);
        if (this.post) {
          this.post = { ...this.post, comments: Math.max(0, this.post.comments - 1) };
        }
        this.cd.detectChanges();
        this.notificationService.success('Comment deleted');
      },
      error: (error: any) => {
        console.error('Error deleting comment:', error);
        this.notificationService.error('Error deleting comment');
      },
    });
  }

  likeComment(commentId: number) {
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return;

    const wasLiked = comment.isLiked;

    // Optimistic update
    const index = this.comments.findIndex((c) => c.id === commentId);
    if (index !== -1) {
      this.comments[index] = {
        ...comment,
        isLiked: !wasLiked,
        likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
      };
      this.cd.detectChanges();
    }

    // Make API call
    const apiCall = wasLiked
      ? this.commentService.unlikeComment(commentId)
      : this.commentService.likeComment(commentId);

    apiCall.subscribe({
      next: () => {
        // Success - UI already updated
      },
      error: (error: any) => {
        console.error('Error toggling comment like:', error);
        // Revert on error
        if (index !== -1) {
          this.comments[index] = {
            ...this.comments[index],
            isLiked: wasLiked,
            likes: wasLiked ? comment.likes + 1 : comment.likes - 1,
          };
          this.cd.detectChanges();
        }
      },
    });
  }

  getUserAvatarUrl(user: User): string {
    if (user.avatar) {
      return user.avatar;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
  }

  getPostMediaUrl(): string {
    if (!this.post?.media || !this.post.media[0]?.url) return '';
    return this.post.media[0].url;
  }

  getOriginalMediaUrl(): string {
    return this.originalMediaUrl();
  }

  getOriginalMediaType(): 'IMAGE' | 'VIDEO' | 'AUDIO' | null {
    return this.originalMediaType();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return this.formatDate(dateString);
  }

  navigateToProfile(userId: number) {
    if (userId === this.currentUser?.id) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profile', userId]);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  onSearchChange(query: string) {
    // Handle search if needed
  }

  onNotificationClick() {
    // Handle notification if needed
  }

  onUserClick() {
    // Handle user menu if needed
  }

  onNavigate(page: string) {
    if (page === 'home') {
      this.router.navigate(['/']);
    } else if (page === 'profile') {
      this.router.navigate(['/profile']);
    } else if (page === 'editor') {
      this.router.navigate(['/create-post']);
    }
  }

  handleEdit(event: Event) {
    event.stopPropagation();
    if (!this.post) return;
    this.editablePost.set({ ...this.post }); // clone current post
    // Store original media URL and type
    this.originalMediaUrl.set(this.post.mediaUrl || '');
    this.originalMediaType.set(this.post.mediaType || null);
    this.editMode.set(true);
    this.showMenu.set(false);
  }

  updateEditableTitle(title: string) {
    this.editablePost.update((p) => ({ ...p, title }));
  }

  updateEditableContent(content: string) {
    this.editablePost.update((p) => ({ ...p, content }));
  }

  cancelEdit(event: Event) {
    event.stopPropagation();
    this.editMode.set(false);
    this.uploadError.set('');
    this.showMenu.set(false);
  }

  keepOriginalMedia(event: Event) {
    event.stopPropagation();
    // Restore original media
    this.editablePost.update((post) => ({
      ...post,
      mediaUrl: this.originalMediaUrl(),
      mediaType: this.originalMediaType(),
    }));
    this.uploadError.set('');
  }

  removeAllMedia(event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove all media from this post?')) {
      this.editablePost.update((post) => ({
        ...post,
        mediaUrl: '',
        mediaType: null,
      }));
      this.uploadError.set('');
    }
  }

  removeNewMedia(event: Event) {
    event.stopPropagation();
    // Restore original media (or empty if there was no original)
    this.editablePost.update((post) => ({
      ...post,
      mediaUrl: this.originalMediaUrl(),
      mediaType: this.originalMediaType(),
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
        const mediaUrl = response.url;
        this.editablePost.update((post) => ({
          ...post,
          mediaUrl,
          mediaType,
        }));
        this.uploadError.set('');
        console.log('File uploaded successfully:', response);
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

    if (!this.post) return;

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
          ...this.post!,
          title: updated.title,
          content: updated.content,
          tags: updated.tags,
          mediaUrl: updated.mediaUrl,
          mediaType: updated.mediaType,
          updatedAt: updated.updatedAt,
          media:
            updated.mediaType && updated.mediaUrl
              ? [{ type: updated.mediaType, url: updated.mediaUrl ?? '' }]
              : [],
        };

        this.editMode.set(false);
        this.showMenu.set(false);
        this.cd.detectChanges();

        this.notificationService.success('Post updated successfully');
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.notificationService.error('Could not update post. Please try again.');
      },
    });
  }

  handleHide(event: Event) {
    event.stopPropagation();

    if (!this.post?.id) {
      this.notificationService.error('Unable to hide post: Post ID not found');
      return;
    }

    const reason = prompt('Please provide a reason for hiding this post (optional):');
    this.adminService.hidePost(this.post.id, reason?.trim() || undefined).subscribe({
      next: () => {
        this.notificationService.success('Post hidden successfully');
        // Update the post locally
        if (this.post) {
          this.post = { ...this.post, hidden: true, hideReason: reason?.trim() };
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Hide failed:', err);
        this.notificationService.error('Failed to hide post. Please try again.');
      },
    });
  }

  handleRestore(event: Event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to restore this post?')) {
      return;
    }

    if (!this.post?.id) {
      this.notificationService.error('Unable to restore post: Post ID not found');
      return;
    }

    this.adminService.restorePost(this.post.id).subscribe({
      next: () => {
        this.notificationService.success('Post restored successfully');
        if (this.post) {
          this.post = { ...this.post, hidden: false, hideReason: undefined };
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Restore failed:', err);
        this.notificationService.error('Failed to restore post. Please try again.');
      },
    });
  }
}
