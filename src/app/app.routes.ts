import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { About } from './components/about/about';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Career } from './components/career/career';
import { ContactComponent } from './components/contact/contact';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { authGuard, guestGuard, adminGuard, customerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signup', component: Signup, canActivate: [guestGuard] },
  { path: 'career', component: Career },
  { path: 'contact', component: ContactComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [customerGuard] },
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [adminGuard] },
  { path: '**', redirectTo: '/home' } // Wildcard route for 404 page
];
