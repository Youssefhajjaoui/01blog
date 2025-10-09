import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserLoginDto, UserRegistrationDto } from '../../models/user.model';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss'
})
export class AuthPageComponent implements OnInit {
  activeTab: 'login' | 'signup' | 'forgot-password' = 'login';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  // Login form
  loginForm: UserLoginDto = {
    email: '',
    password: ''
  };

  // Signup form
  signupForm: UserRegistrationDto = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Forgot password form
  forgotPasswordForm = {
    email: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onLogin(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Use mock login for development
    this.authService.mockLogin(this.loginForm.email, this.loginForm.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  onSignup(): void {
    if (!this.signupForm.name || !this.signupForm.email || !this.signupForm.password || !this.signupForm.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.signupForm.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Use mock registration for development
    this.authService.mockRegister(this.signupForm).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create account. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  onForgotPassword(): void {
    if (!this.forgotPasswordForm.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = '';
      alert('Password reset instructions sent to your email!');
      this.activeTab = 'login';
    }, 1000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  setActiveTab(tab: 'login' | 'signup' | 'forgot-password'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }
}