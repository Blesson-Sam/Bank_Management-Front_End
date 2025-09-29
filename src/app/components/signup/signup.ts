import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  nationalId: string;
  gender: string;
}

interface SignupResponse {
  message: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    nationalId: string;
    gender: string;
  };
}

@Component({
  selector: 'app-signup',
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  private router = inject(Router);
  private http = inject(HttpClient);

  // Form data
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  address = '';
  nationalId = '';
  gender = '';
  
  // Form state
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  private readonly API_URL = 'http://localhost:8080/api/auth/register';

  onSubmit() {
    // Clear previous messages
    this.clearMessages();
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Prepare registration data
    const signupData: SignupRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      phone: this.phone.trim(),
      address: this.address.trim(),
      nationalId: this.nationalId.trim(),
      gender: this.gender
    };

    // Set loading state
    this.isLoading.set(true);

    // Call registration API
    this.http.post<SignupResponse>(this.API_URL, signupData)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('Account created successfully! Please login to continue.');
          
          // Clear form
          this.clearForm();
          
          // Navigate to login after 2 seconds
          setTimeout(() => {
            this.navigateToLogin();
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          
          // Handle different error types
          if (error.status === 400) {
            this.errorMessage.set(error.error?.message || 'Invalid registration data. Please check your inputs.');
          } else if (error.status === 409) {
            this.errorMessage.set('An account with this email already exists. Please use a different email or login.');
          } else if (error.status === 0) {
            this.errorMessage.set('Unable to connect to server. Please check your internet connection.');
          } else {
            this.errorMessage.set('Registration failed. Please try again later.');
          }
          
          console.error('Registration error:', error);
        }
      });
  }

  private validateForm(): boolean {
    // Check required fields
    if (!this.firstName.trim()) {
      this.errorMessage.set('First name is required.');
      return false;
    }
    
    if (!this.lastName.trim()) {
      this.errorMessage.set('Last name is required.');
      return false;
    }
    
    if (!this.email.trim()) {
      this.errorMessage.set('Email is required.');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage.set('Please enter a valid email address.');
      return false;
    }
    
    if (!this.password) {
      this.errorMessage.set('Password is required.');
      return false;
    }
    
    // Password strength validation
    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return false;
    }
    
    if (!this.phone.trim()) {
      this.errorMessage.set('Phone number is required.');
      return false;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(this.phone.replace(/\s|-|\(|\)/g, ''))) {
      this.errorMessage.set('Please enter a valid phone number (10-15 digits).');
      return false;
    }
    
    if (!this.address.trim()) {
      this.errorMessage.set('Address is required.');
      return false;
    }
    
    if (!this.nationalId.trim()) {
      this.errorMessage.set('National ID is required.');
      return false;
    }

    return true;
  }

  private clearForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.phone = '';
    this.address = '';
    this.nationalId = '';
  }

  private clearMessages() {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  clearError() {
    this.errorMessage.set('');
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
