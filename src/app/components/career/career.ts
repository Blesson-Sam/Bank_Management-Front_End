import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-career',
  imports: [],
  templateUrl: './career.html',
  styleUrl: './career.css'
})
export class Career {
  private router = inject(Router);

  navigateToSignup() {
    this.router.navigate(['/contact']);
  }
}
