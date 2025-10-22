import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login/login.component';
import { Signup } from '../signup/signup/signup.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, Login, Signup],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class Auth {
  isLoginMode = true;

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}
