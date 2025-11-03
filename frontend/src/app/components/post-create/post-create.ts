import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotificationService as UINotificationService } from '../../services/ui-notification.service';

@Component({
  selector: 'app-post-create',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './post-create.html',
  styleUrl: './post-create.css',
})
export class PostCreate implements OnInit {
  postForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  tagsInput = '';
  draftLoaded = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private postService: PostService,
    private snackbarService: UINotificationService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: [''],
      mediaUrl: [''],
      mediaType: [''],
    });
  }

  ngOnInit() {
    this.loadDraftFromStorage();
  }

  loadDraftFromStorage() {
    try {
      const draftData = localStorage.getItem('post-draft');
      if (draftData) {
        const draft = JSON.parse(draftData);

        // Restore form data
        if (draft.title) {
          this.postForm.patchValue({ title: draft.title });
        }

        if (draft.content) {
          this.postForm.patchValue({ content: draft.content });
        }

        if (draft.tags && Array.isArray(draft.tags)) {
          this.postForm.patchValue({ tags: draft.tags.join(',') });
        }

        // Show success message
        console.log('Draft loaded successfully from localStorage');
        this.draftLoaded = true;

        // Optional: Show a toast notification
        // You can implement a toast service here if you have one

        // Clear the draft from localStorage after loading
        localStorage.removeItem('post-draft');

        console.log('Draft cleared from localStorage');
      }
    } catch (error) {
      console.error('Error loading draft from localStorage:', error);
      // Clear corrupted draft data
      localStorage.removeItem('post-draft');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result; // <-- updates here
        this.cd.detectChanges(); // manually trigger refresh
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFile(): Promise<string | null> {
    if (!this.selectedFile) return null;

    return new Promise((resolve, reject) => {
      try {
        // Check if user is authenticated before uploading
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          console.error('User not authenticated for file upload');
          reject(new Error('User not authenticated'));
          return;
        }

        console.log('Uploading file for user:', currentUser.username);

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('file', this.selectedFile!);

        this.http
          .post<any>('http://localhost:8080/api/files/upload', formData, {
            withCredentials: true,
          })
          .subscribe({
            next: (response) => {
              console.log('Upload successful:', response);
              resolve(response.url);
            },
            error: (error) => {
              console.error('Upload failed:', error);
              reject(error);
            }
          });
      } catch (error) {
        console.error('Upload failed:', error);
        reject(error);
      }
    });
  }

  onTextareaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.onContentChange(target.value);
    }
  }

  onContentChange(content: string) {
    this.postForm.patchValue({ content });
  }

  async onSubmit() {
    if (this.postForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Check if user is authenticated
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not authenticated');
        this.snackbarService.error('You must be logged in to create a post. Please log in and try again.');
        this.router.navigate(['/auth']);
        this.isSubmitting = false;
        return;
      }

      console.log('Current user:', currentUser);

      try {
        // Upload file if selected
        let mediaUrl = '';
        let mediaType = null;

        if (this.selectedFile) {
          const uploadedUrl = await this.uploadFile();
          if (uploadedUrl) {
            mediaUrl = uploadedUrl;
            mediaType = this.selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
          }
        }

        // Prepare post data
        const postData = {
          title: this.postForm.value.title,
          content: this.postForm.value.content,
          tags: this.postForm.value.tags
            ? this.postForm.value.tags.split(',').map((tag: string) => tag.trim())
            : [],
          mediaUrl: mediaUrl || null,
          mediaType: mediaType,
        };

        // Create post
        const response = await this.postService.createPost(postData).toPromise();

        console.log('Post created successfully:', response);
        this.snackbarService.success('Post created successfully!');

        // Redirect to home page or post detail
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Error creating post:', error);
        this.snackbarService.error('Failed to create post. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.postForm.patchValue({ mediaUrl: null, mediaType: null });
  }

  saveDraft() {
    // Save draft functionality - stores in localStorage
    const draftData = {
      title: this.postForm.get('title')?.value || '',
      content: this.postForm.get('content')?.value || '',
      tags: this.getTagsArray(),
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem('post-draft', JSON.stringify(draftData));
      console.log('Draft saved successfully to localStorage');
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
      alert('Failed to save draft. Please try again.');
    }
  }

  onTagKeydown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      this.addTagFromInput();
    }
  }

  addTagFromInput() {
    if (this.tagsInput.trim()) {
      const newTags = [...this.getTagsArray(), this.tagsInput.trim()];
      if (newTags.length <= 10) {
        this.postForm.patchValue({ tags: newTags.join(',') });
        this.tagsInput = '';
      }
    }
  }

  removeTag(tagToRemove: string) {
    const currentTags = this.getTagsArray();
    const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);
    this.postForm.patchValue({ tags: updatedTags.join(',') });
  }

  getTagsArray(): string[] {
    const tagsValue = this.postForm.get('tags')?.value || '';
    return tagsValue
      ? tagsValue
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag)
      : [];
  }

  getTagsCount(): number {
    return this.getTagsArray().length;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('media') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getAvatarUrl(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.avatar) {
      return currentUser.avatar;
    }
    // Fallback to generated avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'user'}`;
  }

  onNavigate(page: string) {
    if (page === 'home') {
      this.router.navigate(['/']);
    }
  }

  onSearchChange(query: string) {
    // Implement search functionality if needed
  }

  onNotificationClick() {
    // Implement notification functionality
  }

  onUserClick() {
    // Implement user menu functionality
  }
}
