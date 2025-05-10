import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-google-fit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="google-fit-container">
      <div *ngIf="!isCallback" class="connect-container">
        <div class="header">
          <h2>Connect Google Fit</h2>
          <p>Connect your Google Fit account to share your health data with your doctor.</p>
        </div>
        
        <div class="info-section">
          <h3>Why connect Google Fit?</h3>
          <ul>
            <li>Share your activity data with your doctor</li>
            <li>Monitor your heart rate over time</li>
            <li>Track your sleep patterns</li>
          </ul>
          
          <h3>Data we access:</h3>
          <ul>
            <li>Physical activity data</li>
            <li>Heart rate measurements</li>
            <li>Sleep data</li>
          </ul>
          
          <p class="privacy-note">
            Your data is secure and will only be shared with your healthcare provider.
            You can disconnect Google Fit at any time.
          </p>
        </div>
        
        <div class="actions">
          <button 
            *ngIf="!isConnected" 
            (click)="connectGoogleFit()" 
            class="connect-button">
            Connect Google Fit
          </button>
          
          <div *ngIf="isConnected" class="connected-status">
            <span class="connected-badge">Connected</span>
            <button (click)="disconnectGoogleFit()" class="disconnect-button">
              Disconnect
            </button>
          </div>
          
          <button (click)="skipConnection()" class="skip-button">
            Skip this step
          </button>
        </div>
      </div>
      
      <div *ngIf="isCallback" class="callback-container">
        <div *ngIf="isLoading" class="loading">
          <p>Processing your Google Fit connection...</p>
          <!-- Add loading spinner here if desired -->
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
    </div>
  `,
  styles: [`
    .google-fit-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .header h2 {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    .info-section {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .info-section h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .info-section ul {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }
    
    .info-section li {
      margin-bottom: 0.5rem;
    }
    
    .privacy-note {
      font-size: 0.9rem;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 1rem;
      margin-top: 1rem;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      min-width: 200px;
    }
    
    .connect-button {
      background-color: #4285F4;
      color: white;
    }
    
    .skip-button {
      background-color: transparent;
      color: #666;
      text-decoration: underline;
    }
    
    .connected-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .connected-badge {
      background-color: #34A853;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }
    
    .disconnect-button {
      background-color: #EA4335;
      color: white;
    }
    
    .callback-container {
      text-align: center;
      padding: 2rem;
    }
    
    .loading, .error, .success {
      padding: 2rem;
    }
    
    .retry-button {
      background-color: #4285F4;
      color: white;
      margin-top: 1rem;
    }
    
    .continue-button {
      background-color: #34A853;
      color: white;
      margin-top: 1rem;
    }
  `]
})
export class GoogleFitComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isCallback = false;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isConnected = false;

  ngOnInit() {
    // Check if this is a callback from Google OAuth
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.isCallback = true;
        this.handleCallback(params['code']);
      } else {
        // Check if Google Fit is already connected
        this.isConnected = this.authService.isGoogleFitConnected();
      }
    });
  }

  connectGoogleFit() {
    const authUrl = this.authService.getGoogleFitAuthUrl();
    window.location.href = authUrl;
  }

  async handleCallback(code: string) {
    this.isLoading = true;
    this.hasError = false;
    
    try {
      await this.authService.handleGoogleFitCallback(code);
      this.isConnected = true;
      this.isLoading = false;
    } catch (error) {
      this.hasError = true;
      this.isLoading = false;
      this.errorMessage = 'Failed to connect to Google Fit. Please try again.';
      console.error('Google Fit connection error:', error);
    }
  }

  disconnectGoogleFit() {
    this.authService.disconnectGoogleFit();
    this.isConnected = false;
  }

  retryConnection() {
    this.connectGoogleFit();
  }

  skipConnection() {
    this.continueToNextStep();
  }

  continueToNextStep() {
    // Navigate to the next step in the appointment booking process
    this.router.navigate(['/app/new-appointment']);
  }
} 