# Authentication Page

## Overview
A beautiful authentication page with toggle functionality between Login and Sign Up forms on a single route `/auth`.

## Features

### Main Auth Component (`/auth` route)
- **Toggle Tabs**: Switch between Login and Sign Up modes
- **Dynamic Content**: Shows appropriate form based on selected tab
- **Responsive Design**: Mobile-friendly layout
- **Beautiful UI**: Modern gradient background with card-based design

### Login Component
- Email and password fields
- Password visibility toggle
- "Remember me" checkbox
- Forgot password link
- Social login options (Google, GitHub)
- Form validation with error messages
- Loading state during authentication

### Sign Up Component
- Username, email, and password fields
- Password confirmation with visibility toggles
- Password strength hint (minimum 8 characters)
- Terms of Service acceptance
- Social sign up options (Google, GitHub)
- Comprehensive form validation
- Loading state during registration

## Routes

- `/auth` - Main authentication page (default route)
- Route is configured in `src/app/app.routes.ts`

## Usage

### Running the App

```bash
# Navigate to frontend directory
cd /home/youzar-boot/01Blog/frontend

# Install dependencies (if not already installed)
npm install

# Start development server
ng serve

# Or use npm
npm start
```

Then navigate to `http://localhost:4200/auth` in your browser.

## File Structure

```
src/app/auth/
├── auth/
│   ├── auth.component.ts       # Main auth component with toggle logic
│   ├── auth.component.html     # Template with tabs and component switching
│   ├── auth.component.css      # Styling for auth container
│   └── auth.spec.ts            # Unit tests
├── login/
│   └── login/
│       ├── login.component.ts       # Login form logic
│       ├── login.component.html     # Login form template
│       ├── login.component.css      # Login form styles
│       └── login.spec.ts            # Login unit tests
└── signup/
    └── signup/
        ├── signup.component.ts      # Sign up form logic
        ├── signup.component.html    # Sign up form template
        ├── signup.component.css     # Sign up form styles
        └── signup.spec.ts           # Sign up unit tests
```

## Customization

### Styling
- Colors and gradients can be modified in the respective CSS files
- The main gradient is: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- All components use modern, professional color schemes

### Validation
- Password must be at least 8 characters
- All fields are required
- Email format validation
- Password confirmation matching
- Terms acceptance required for sign up

### Integration
To integrate with your backend authentication service:

1. **Login Component** (`login.component.ts`):
   - Replace the `setTimeout` in `onSubmit()` with your auth service call
   - Uncomment the router navigation after successful login

2. **Sign Up Component** (`signup.component.ts`):
   - Replace the `setTimeout` in `onSubmit()` with your auth service call
   - Uncomment the router navigation after successful registration

Example:
```typescript
// In login.component.ts or signup.component.ts
constructor(
  private router: Router,
  private authService: AuthService  // Inject your auth service
) {}

onSubmit() {
  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      this.errorMessage = error.message;
      this.isLoading = false;
    }
  });
}
```

## Features Overview

### Password Visibility Toggle
- Eye icon buttons to show/hide passwords
- Separate toggles for password and confirm password

### Social Login/Sign Up
- Google and GitHub buttons included
- Currently placeholders - integrate with your OAuth providers

### Error Handling
- Client-side validation with user-friendly error messages
- Error message component displays validation errors

### Loading States
- Buttons show loading text during form submission
- Disabled state prevents multiple submissions

### Responsive Design
- Mobile-optimized layout
- Adapts to different screen sizes
- Touch-friendly controls

## Next Steps

1. Create an authentication service to handle API calls
2. Implement JWT token storage
3. Add password reset functionality
4. Integrate OAuth providers (Google, GitHub)
5. Add route guards for protected pages
6. Implement session management

## Notes

- All components are standalone (Angular 18+ pattern)
- Uses FormsModule for template-driven forms
- RouterModule for navigation
- CommonModule for directives (*ngIf, *ngFor, etc.)

