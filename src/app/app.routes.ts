import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Career } from './career/career';
import { ContactComponent } from './contact/contact';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'career', component: Career },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '/home' } // Wildcard route for 404 page
];
