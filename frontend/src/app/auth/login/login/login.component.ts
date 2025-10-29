import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService as UINotificationService } from '../../../services/ui-notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class Login {
  username = signal('');
  password = signal('');
  rememberMe = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private router: Router, private authService: AuthService, private notificationService: UINotificationService) { }
  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.username() && this.password()) {
      this.authService.login({ username: this.username(), password: this.password() }).subscribe({
        next: (res) => {
          console.log('Login success', res);
          this.notificationService.success('Welcome back!');
          this.isLoading.set(false); // ✅ immediately stop loading
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed:', err);

          // Extract error message from different possible backend formats:
          // 1. {"error":"Unauthorized","message":"..."}
          // 2. {"message":"..."} (AuthResponseDto)
          // 3. Plain string
          let errorMsg = 'Login failed. Please check your credentials.';

          if (err.error) {
            // Check for nested error structure
            if (err.error.message) {
              errorMsg = err.error.message;
            } else if (err.error.error) {
              errorMsg = err.error.error;
            } else if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error && Object.keys(err.error).length > 0) {
              // Handle validation errors or other object formats
              const errorValues = Object.values(err.error);
              if (errorValues.length > 0 && typeof errorValues[0] === 'string') {
                errorMsg = errorValues[0] as string;
              }
            }
          } else if (err.message) {
            errorMsg = err.message;
          }

          // Log full error for debugging - this helps identify the exact error format
          console.error('Full error object:', {
            status: err.status,
            statusText: err.statusText,
            error: err.error,
            extractedMessage: errorMsg,
            rawError: err
          });

          this.errorMessage.set(errorMsg);
          this.notificationService.error(errorMsg);
          this.isLoading.set(false); // ✅ stop loading on error
        },
      });
    } else {
      this.errorMessage.set('Please fill in all fields');
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  fillDemoUser() {
    this.username.set('user@demo.com');
    this.password.set('demo12345');
  }

  fillDemoAdmin() {
    this.username.set('admin@01blog.com');
    this.password.set('demo12345');
  }
}
