import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('BankUI');
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // Authentication state from service
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  
  // Route tracking
  isOnDashboard = signal(false);
  
  // Theme management
  isDarkMode = signal(false);
  
  // Mobile menu management
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);

    // Track route changes to detect dashboard (both customer and admin)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isDashboard = event.url === '/dashboard' || event.url === '/admin-dashboard';
        this.isOnDashboard.set(isDashboard);
      });

    // Set initial state based on current URL
    const currentUrl = this.router.url;
    this.isOnDashboard.set(currentUrl === '/dashboard' || currentUrl === '/admin-dashboard');
  }

  toggleTheme() {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  navigateToDashboard() {
    this.authService.navigateToRoleDashboard();
  }

  logout() {
    // Use auth service to logout
    this.authService.logout();
    
    // Close mobile menu if open
    this.closeMobileMenu();
    
    // Redirect to home
    this.router.navigate(['/home']);
  }
}
