import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  // 👇 inject AuthService properly (you forgot `private`)
  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.username && this.password) {
      this.authService.login( this.username ,  this.password).subscribe({
        next: (res) => {
          console.log('Login success', res);
          // Optionally navigate somewhere
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.errorMessage = 'Invalid credentials';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all fields';
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  fillDemoUser() {
    this.username = 'user@demo.com';
    this.password = 'demo12345';
  }

  fillDemoAdmin() {
    this.username = 'admin@01blog.com';
    this.password = 'demo12345';
  }
}
