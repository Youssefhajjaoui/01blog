import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class Signup {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  bio = '';
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  avatarBase64: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private cd: ChangeDetectorRef) { }

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    // Basic validation
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields';
      this.isLoading = false;
      return;
    }

    if (this.username.length < 3 || this.username.length > 50) {
      this.errorMessage = 'Username must be between 3 and 50 characters';
      this.isLoading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      this.isLoading = false;
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.isLoading = false;
      return;
    }

    try {
      // Prepare user data with base64 avatar
      const userData = {
        username: this.username,
        email: this.email,
        password: this.password,
        bio: this.bio,
        avatar: this.avatarBase64, // Send as base64 string
      };

      const response = await fetch('http://localhost:9090/api/auth/register', {
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
      this.errorMessage = '';
      alert('Account created successfully! Please login with your credentials.');
      this.router.navigate(['/auth/login']);
    } catch (err: any) {
      console.error('Signup error:', err);
      this.errorMessage = err.message || 'Signup failed';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      this.avatarFile = file;
      // Create preview and base64
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
        this.avatarBase64 = e.target?.result as string;
        console.log('Avatar preview set:', this.avatarPreview ? 'Yes' : 'No');
        this.cd.detectChanges(); // Move detectChanges inside the callback
      };
      reader.readAsDataURL(file);

      this.errorMessage = '';
    }
  }

  removeAvatar() {
    this.avatarFile = null;
    this.avatarPreview = null;
    this.avatarBase64 = null;
  }
}
