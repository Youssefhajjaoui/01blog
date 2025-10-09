import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class Login {
  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router) {}

  async onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.username && this.password) {
      try {
        console.log('Login attempt:', {
          username: this.username,
          password: this.password,
          rememberMe: this.rememberMe,
        });

        const res = await fetch('http://localhost:9090/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Invalid credentials');
        }

        const data = await res.json();
        console.log('Login success:', data);

        // Optional: store token
        localStorage.setItem('token', data.token);

        // Navigate to dashboard after success
        // this.router.navigate(['/dashboard']);
      } catch (err: any) {
        console.error('Login failed:', err);
        this.errorMessage = err.message || 'Login failed';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Please fill in all fields';
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Demo account quick fill methods
  fillDemoUser() {
    this.username = 'user@demo.com';
    this.password = 'demo12345';
  }

  fillDemoAdmin() {
    this.username = 'admin@01blog.com';
    this.password = 'demo12345';
  }
}
