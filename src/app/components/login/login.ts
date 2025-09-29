import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface LoginRequest {
  email: string;
  password: string;
  userType: string;
}

interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Form data
  email = signal('');
  password = signal('');
  userType = signal<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  
  // UI state
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  closeModal() {
    this.router.navigate(['/home']);
  }

  onSubmit() {
    // Reset error message
    this.errorMessage.set('');
    
    // Validate form
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    // Set loading state
    this.isLoading.set(true);

    const loginRequest: LoginRequest = {
      email: this.email(),
      password: this.password(),
      userType: this.userType()
    };

    // Make API call
    console.log('Making login request:', loginRequest);
    this.http.post<LoginResponse>('http://localhost:8080/api/auth/login', loginRequest)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          
          // Use auth service to handle login
          this.authService.login(response);

          // Reset loading state
          this.isLoading.set(false);

          console.log('Navigating to role-based dashboard...');
          // Redirect to appropriate dashboard based on user role
          this.authService.navigateToRoleDashboard();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login error:', error);
          
          // Reset loading state
          this.isLoading.set(false);

          // Handle different error scenarios
          if (error.status === 401 || error.status === 400) {
            this.errorMessage.set('Invalid email or password');
          } else if (error.status === 0) {
            this.errorMessage.set('Unable to connect to server. Please try again.');
          } else {
            this.errorMessage.set('An error occurred. Please try again.');
          }
        }
      });
  }

  // Method to clear error when user starts typing
  clearError() {
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  // Method to toggle user type
  toggleUserType() {
    this.userType.set(this.userType() === 'CUSTOMER' ? 'ADMIN' : 'CUSTOMER');
    this.clearError();
  }

  // Method to toggle password visibility
  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
