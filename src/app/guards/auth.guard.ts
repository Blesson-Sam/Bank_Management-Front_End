import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect based on user role
    authService.navigateToRoleDashboard();
    return false;
  }
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  } else if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const customerGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isCustomer()) {
    return true;
  } else if (authService.isAuthenticated()) {
    // User is authenticated but not customer, redirect to admin dashboard
    router.navigate(['/admin-dashboard']);
    return false;
  } else {
    // User is not authenticated, redirect to login
    router.navigate(['/login']);
    return false;
  }
};