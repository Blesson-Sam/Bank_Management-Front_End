import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  gender: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  
  // Authentication state
  private _isAuthenticated = signal(false);
  private _currentUser = signal<User | null>(null);
  
  // Session management
  private sessionActive = true;
  private lastActivityTime = Date.now();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly NAVIGATION_SESSION_KEY = 'banking_session_active';
  
  // Public readonly signals
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.checkAuthenticationState();
    this.setupBrowserNavigationHandling();
    this.setupSessionTimeout();
    
    // Listen for storage changes (for logout in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken' || e.key === this.NAVIGATION_SESSION_KEY) {
        this.checkAuthenticationState();
      }
    });
  }

  checkAuthenticationState() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');
    const gender = localStorage.getItem('userGender');

    if (token && firstName && email && id) {
      this._isAuthenticated.set(true);
      this._currentUser.set({
        id: parseInt(id),
        email: email,
        firstName: firstName,
        lastName: lastName || '',
        userType: userType || 'CUSTOMER',
        gender: gender || 'null'
      });
      console.log('AuthService: User is authenticated', this._currentUser());
    } else {
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
    }
  }

  login(loginResponse: any) {
    // Store authentication data
    localStorage.setItem('authToken', loginResponse.token);
    localStorage.setItem('userType', loginResponse.userType);
    localStorage.setItem('userId', loginResponse.id.toString());
    localStorage.setItem('userEmail', loginResponse.email);
    localStorage.setItem('userFirstName', loginResponse.firstName);
    localStorage.setItem('userLastName', loginResponse.lastName);
    localStorage.setItem('userGender', loginResponse.gender);

    // Set up session management
    this.sessionActive = true;
    this.lastActivityTime = Date.now();
    sessionStorage.setItem(this.NAVIGATION_SESSION_KEY, 'active');
    localStorage.removeItem('session_navigation_time');

    // Update authentication state
    this._isAuthenticated.set(true);
    this._currentUser.set({
      id: loginResponse.id,
      email: loginResponse.email,
      firstName: loginResponse.firstName,
      lastName: loginResponse.lastName,
      userType: loginResponse.userType,
      gender: loginResponse.gender
    });
  }

  logout() {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('session_navigation_time');
    
    // Clear session data
    sessionStorage.removeItem(this.NAVIGATION_SESSION_KEY);
    this.sessionActive = false;
    
    // Update authentication state
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated() && this.sessionActive;
  }

  private setupBrowserNavigationHandling() {
    // Set session as active when user logs in
    if (this.getToken()) {
      sessionStorage.setItem(this.NAVIGATION_SESSION_KEY, 'active');
    }

    // Handle page visibility changes (when user switches tabs or minimizes browser)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched away from the tab
        this.handleUserNavigation();
      } else {
        // User came back to the tab
        this.validateSessionOnReturn();
      }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      if (this._isAuthenticated()) {
        this.handleBrowserNavigation();
      }
    });

    // Handle page unload (when user navigates away or closes tab)
    window.addEventListener('beforeunload', () => {
      if (this._isAuthenticated()) {
        this.handleUserNavigation();
      }
    });

    // Handle page focus (when user comes back to the page)
    window.addEventListener('focus', () => {
      if (this._isAuthenticated()) {
        this.validateSessionOnReturn();
      }
    });
  }

  private setupSessionTimeout() {
    // Check session timeout every minute
    setInterval(() => {
      if (this._isAuthenticated()) {
        const now = Date.now();
        if (now - this.lastActivityTime > this.SESSION_TIMEOUT) {
          console.log('Session timeout - logging out user');
          this.expireSession('Session expired due to inactivity');
        }
      }
    }, 60000); // Check every minute

    // Update activity time on user interactions
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, () => {
        if (this._isAuthenticated()) {
          this.lastActivityTime = Date.now();
        }
      }, { passive: true });
    });
  }

  private handleUserNavigation() {
    if (this._isAuthenticated()) {
      // Mark session as potentially compromised when user navigates away
      sessionStorage.removeItem(this.NAVIGATION_SESSION_KEY);
      localStorage.setItem('session_navigation_time', Date.now().toString());
    }
  }

  private handleBrowserNavigation() {
    // If user uses browser back/forward buttons while on protected pages
    const currentPath = window.location.pathname;
    if (currentPath === '/dashboard' && this._isAuthenticated()) {
      // Force logout when user tries to navigate using browser buttons
      this.expireSession('Session expired due to unauthorized navigation');
    }
  }

  private validateSessionOnReturn() {
    if (!this._isAuthenticated()) return;

    const sessionActive = sessionStorage.getItem(this.NAVIGATION_SESSION_KEY);
    const navigationTime = localStorage.getItem('session_navigation_time');
    
    if (!sessionActive && navigationTime) {
      const timeAway = Date.now() - parseInt(navigationTime);
      
      // If user was away for more than 30 seconds, expire session
      if (timeAway > 3000000) {
        this.expireSession('Session expired due to navigation away from the application');
        return;
      }
    }

    // Restore session if user comes back quickly
    if (this._isAuthenticated()) {
      sessionStorage.setItem(this.NAVIGATION_SESSION_KEY, 'active');
      localStorage.removeItem('session_navigation_time');
    }
  }

  expireSession(reason: string) {
    console.log('Expiring session:', reason);
    
    // Clear all authentication data
    this.logout();
    
    // Show alert to user
    alert(reason + '. Please log in again.');
    
    // Redirect to home page
    this.router.navigate(['/home']);
  }

  updateActivity() {
    this.lastActivityTime = Date.now();
    if (this._isAuthenticated()) {
      sessionStorage.setItem(this.NAVIGATION_SESSION_KEY, 'active');
    }
  }

  // Role checking methods
  isAdmin(): boolean {
    return this._currentUser()?.userType === 'ADMIN';
  }

  isCustomer(): boolean {
    return this._currentUser()?.userType === 'CUSTOMER';
  }

  getUserType(): string {
    return this._currentUser()?.userType || '';
  }

  // Role-based navigation
  navigateToRoleDashboard() {
    if (this.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
    } else if (this.isCustomer()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}