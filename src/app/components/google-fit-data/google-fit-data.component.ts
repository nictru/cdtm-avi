import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleFitService } from '../../services/google-fit.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-google-fit-data',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="google-fit-data-container">
      <div class="header">
        <h2>Your Health Data</h2>
        <p>This data will be shared with your healthcare provider</p>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        <p>Loading your health data...</p>
        <!-- Add loading spinner here -->
      </div>
      
      <div *ngIf="hasError" class="error">
        <h3>Error Loading Data</h3>
        <p>{{ errorMessage }}</p>
        <button (click)="retryLoading()" class="retry-button">
          Try Again
        </button>
      </div>
      
      <div *ngIf="!isLoading && !hasError" class="data-sections">
        <!-- Step Count Data Section -->
        <div class="data-section">
          <h3>Step Count</h3>
          <div class="step-count">
            <div class="data-value">{{ stepCount }}</div>
            <div class="data-label">steps in the last 7 days</div>
          </div>
        </div>
        
        <!-- Activity Data Section -->
        <div class="data-section">
          <h3>Activity Data</h3>
          <div *ngIf="activityData.length === 0" class="no-data">
            No activity data available for the selected period.
          </div>
          <div *ngIf="activityData.length > 0" class="data-list">
            <div *ngFor="let activity of activityData" class="data-item">
              <div class="data-type">{{ activity.type }}</div>
              <div class="data-value">{{ activity.duration }} minutes</div>
              <div class="data-date">{{ activity.date | date:'medium' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Heart Rate Data Section -->
        <div class="data-section">
          <h3>Heart Rate Data</h3>
          <div *ngIf="heartRateData.length === 0" class="no-data">
            No heart rate data available for the selected period.
          </div>
          <div *ngIf="heartRateData.length > 0" class="data-list">
            <div *ngFor="let heartRate of heartRateData" class="data-item">
              <div class="data-value">{{ heartRate.value }} bpm</div>
              <div class="data-date">{{ heartRate.date | date:'medium' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Sleep Data Section -->
        <div class="data-section">
          <h3>Sleep Data</h3>
          <div *ngIf="sleepData.length === 0" class="no-data">
            No sleep data available for the selected period.
          </div>
          <div *ngIf="sleepData.length > 0" class="data-list">
            <div *ngFor="let sleep of sleepData" class="data-item">
              <div class="data-value">{{ sleep.duration }} hours</div>
              <div class="data-date">{{ sleep.startTime | date:'medium' }} - {{ sleep.endTime | date:'medium' }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="continueToNextStep()" class="continue-button">
          Continue
        </button>
        <button (click)="disconnectGoogleFit()" class="disconnect-button">
          Disconnect Google Fit
        </button>
      </div>
    </div>
  `,
  styles: [`
    .google-fit-data-container {
      max-width: 800px;
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
    
    .data-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .data-section {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 1.5rem;
    }
    
    .data-section h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.2rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.5rem;
    }
    
    .step-count {
      text-align: center;
      padding: 1rem;
    }
    
    .step-count .data-value {
      font-size: 3rem;
      font-weight: 700;
      color: #4285F4;
    }
    
    .step-count .data-label {
      font-size: 1rem;
      color: #666;
    }
    
    .data-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .data-item {
      background-color: white;
      border-radius: 4px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .data-type {
      font-weight: 500;
    }
    
    .data-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #4285F4;
    }
    
    .data-date {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
    
    .no-data {
      color: #666;
      font-style: italic;
    }
    
    .loading, .error {
      text-align: center;
      padding: 2rem;
    }
    
    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .continue-button {
      background-color: #34A853;
      color: white;
    }
    
    .disconnect-button {
      background-color: #EA4335;
      color: white;
    }
    
    .retry-button {
      background-color: #4285F4;
      color: white;
      margin-top: 1rem;
    }
  `]
})
export class GoogleFitDataComponent implements OnInit {
  private googleFitService = inject(GoogleFitService);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  // Data from Google Fit
  stepCount = 0;
  activityData: any[] = [];
  heartRateData: any[] = [];
  sleepData: any[] = [];
  
  ngOnInit() {
    this.loadGoogleFitData();
  }
  
  async loadGoogleFitData() {
    this.isLoading = true;
    this.hasError = false;
    
    try {
      // First, fetch and store all data using the new secure method
      await this.googleFitService.fetchAndStoreAllData();
      
      // Then load the data from Supabase
      await this.loadHealthDataFromSupabase();
      
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = 'Failed to load Google Fit data. Please try again.';
      console.error('Error loading Google Fit data:', error);
    }
  }
  
  async loadHealthDataFromSupabase() {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }
      
      const userId = this.authService.userId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('health_data')
        .select('data')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (data && data.data) {
        this.stepCount = data.data.stepCount || 0;
        this.activityData = data.data.activityData || [];
        this.heartRateData = data.data.heartRateData || [];
        this.sleepData = data.data.sleepData || [];
      }
    } catch (error) {
      console.error('Error loading health data from Supabase:', error);
      throw error;
    }
  }
  
  retryLoading() {
    this.loadGoogleFitData();
  }
  
  disconnectGoogleFit() {
    // This would need to be implemented in the GoogleFitService
    alert('This feature is not implemented in this demo.');
    this.router.navigate(['/app/googlefit']);
  }
  
  continueToNextStep() {
    // Get the parent component to update its state
    const appointmentComponent = window.history.state?.appointmentComponent;
    if (appointmentComponent && appointmentComponent.completeGoogleFitStep) {
      appointmentComponent.completeGoogleFitStep();
    }
    
    // Navigate back to the appointment flow
    this.router.navigate(['/app/new-appointment']);
  }
} 