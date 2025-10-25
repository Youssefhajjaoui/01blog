import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) { }
  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.username() && this.password()) {
      this.authService.login({ username: this.username(), password: this.password() }).subscribe({
        next: (res) => {
          console.log('Login success', res);
          this.isLoading.set(false); // ✅ immediately stop loading
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage.set(err.error.message || 'Login failed');
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
