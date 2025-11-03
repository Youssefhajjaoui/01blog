import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService as UINotificationService } from '../../../services/ui-notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class Signup {
  username = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  bio = signal('');
  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  avatarBase64 = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private router: Router, private notificationService: UINotificationService) {}

  async onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Basic validation - read signal values with ()
    if (!this.username() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Please fill in all required fields');
      this.isLoading.set(false);
      return;
    }

    if (this.username().length < 3 || this.username().length > 50) {
      this.errorMessage.set('Username must be between 3 and 50 characters');
      this.isLoading.set(false);
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      this.isLoading.set(false);
      return;
    }

    if (this.password().length < 8) {
      this.errorMessage.set('Password must be at least 8 characters long');
      this.isLoading.set(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMessage.set('Please enter a valid email address');
      this.isLoading.set(false);
      return;
    }

    try {
      // Prepare user data with base64 avatar
      const userData = {
        username: this.username(),
        email: this.email(),
        password: this.password(),
        bio: this.bio(),
        avatar: this.avatarBase64(), // Send as base64 string
      };

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle different error response formats
        if (errorData.message) {
          throw new Error(errorData.message);
        } else if (typeof errorData === 'object') {
          // Handle validation errors object
          const errorMessages = Object.values(errorData).join(', ');
          throw new Error(errorMessages);
        } else {
          throw new Error('Signup failed. Please try again.');
        }
      }

      const data = await response.json();
      console.log('Signup successful:', data);

      // Show success message and redirect to login
      this.errorMessage.set('');
      this.notificationService.success(
        'Account created successfully! Please login with your credentials.'
      );
    } catch (err: any) {
      console.error('Signup error:', err);
      this.errorMessage.set(err.message || 'Signup failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Image size should be less than 5MB');
        return;
      }

      this.avatarFile.set(file);
      // Create preview and base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.avatarPreview.set(result);
        this.avatarBase64.set(result);
        console.log('Avatar preview set:', this.avatarPreview() ? 'Yes' : 'No');
        // No need for detectChanges - signals auto-update the UI!
      };
      reader.readAsDataURL(file);

      this.errorMessage.set('');
    }
  }

  removeAvatar() {
    this.avatarFile.set(null);
    this.avatarPreview.set(null);
    this.avatarBase64.set(null);
  }
}
