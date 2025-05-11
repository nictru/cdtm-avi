import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleFitService } from '../../services/google-fit.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-fit-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div class="p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-bold mb-4">Connecting to Google Fit</h1>
        <div class="flex justify-center mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p class="text-gray-600">Please wait while we complete the connection...</p>
        <p *ngIf="error" class="text-red-500 mt-4">{{ error }}</p>
      </div>
    </div>
  `,
})
export class GoogleFitCallbackComponent implements OnInit {
  private googleFitService = inject(GoogleFitService);
  private router = inject(Router);
  
  error: string | null = null;

  ngOnInit(): void {
    this.handleCallback();
  }

  async handleCallback(): Promise<void> {
    try {
      // Process the callback and link the Google identity
      const success = await this.googleFitService.handleAuthCallback();
      
      if (!success) {
        this.error = 'Failed to connect Google Fit. Please try again.';
      }
      
      // Note: The redirect is handled inside handleAuthCallback
    } catch (error) {
      console.error('Error handling callback:', error);
      this.error = 'An error occurred. Please try again.';
      
      // If there's an error, redirect after a delay
      setTimeout(() => {
        this.router.navigateByUrl('/app/dashboard');
      }, 3000);
    }
  }
} 