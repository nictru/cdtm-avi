import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-google-fit-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div *ngIf="isLoading" class="loading">
        <h3>Connecting to Google Fit...</h3>
        <p>Please wait while we complete your connection.</p>
        <!-- Add a loading spinner or animation here -->
      </div>
      
      <div *ngIf="!isLoading && hasError" class="error">
        <h3>Connection Error</h3>
        <p>{{ errorMessage }}</p>
        <button (click)="retryConnection()" class="retry-button">
          Try Again
        </button>
      </div>
      
      <div *ngIf="!isLoading && !hasError" class="success">
        <h3>Successfully Connected!</h3>
        <p>Your Google Fit account has been connected.</p>
        <button (click)="continueToNextStep()" class="continue-button">
          Continue
        </button>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      max-width: 500px;
      margin: 4rem auto;
      padding: 2rem;
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .loading, .error, .success {
      padding: 1rem;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      margin-top: 1.5rem;
    }
    
    .retry-button {
      background-color: #4285F4;
      color: white;
    }
    
    .continue-button {
      background-color: #34A853;
      color: white;
    }
  `]
})
export class GoogleFitCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = true;
  hasError = false;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      
      if (error) {
        this.handleError(error);
      } else if (code) {
        this.handleCode(code);
      } else {
        this.handleError('No authorization code received');
      }
    });
  }

  async handleCode(code: string) {
    try {
      await this.authService.handleGoogleFitCallback(code);
      this.isLoading = false;
    } catch (error) {
      this.handleError('Failed to exchange authorization code for tokens');
      console.error('Google Fit callback error:', error);
    }
  }

  handleError(message: string) {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message || 'An unknown error occurred';
  }

  retryConnection() {
    // Redirect back to the Google Fit connection page
    this.router.navigate(['/app/googlefit']);
  }

  continueToNextStep() {
    // Navigate back to the appointment flow
    this.router.navigate(['/app/new-appointment']);
  }
}
