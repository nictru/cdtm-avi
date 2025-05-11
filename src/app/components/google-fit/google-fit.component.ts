// google-fit-connect.component.ts
import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../services/auth/auth.service'
import { environment } from '../../../environments/environment'
import { GoogleFitService } from '../../services/google-fit.service'

@Component({
  selector: 'app-google-fit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
      <div class="flex items-center mb-6">
        <img src="assets/icons/google-fit.svg" alt="Google Fit" class="w-12 h-12 mr-4" 
             onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Fit_icon.svg';">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Connect Google Fit</h2>
          <p class="text-gray-500 mt-1">Share your activity, heart rate, and sleep data with your doctor (optional).</p>
        </div>
      </div>

      <div class="mb-4">
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex items-start">
          <svg class="h-5 w-5 text-blue-400 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-blue-700">
            Your anonymous identity will be preserved. Only the health data you choose to share will be accessed.
          </span>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="isConnected" class="mb-6">
          <div class="flex items-center mb-4 bg-green-50 p-4 rounded-lg">
            <span class="inline-flex items-center justify-center w-10 h-10 mr-3 bg-green-500 rounded-full">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </span>
            <div>
              <h3 class="text-lg font-medium text-green-700">Connected to Google Fit</h3>
              <p class="text-green-600">Your health data is being synced securely</p>
            </div>
          </div>
          <button 
            (click)="syncData()" 
            [disabled]="isSyncing"
            class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors mb-2">
            <span *ngIf="isSyncing" class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></span>
            {{ isSyncing ? 'Syncing Data...' : 'Sync Data Now' }}
          </button>
          <button 
            (click)="disconnect()" 
            class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Disconnect Google Fit
          </button>
        </div>
        <div *ngIf="!isConnected" class="mb-6">
          <button 
            (click)="connect()" 
            class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <img src="assets/icons/google-fit.svg" alt="Google Fit" class="w-6 h-6 mr-2"
                 onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Fit_icon.svg';">
            Connect Google Fit
          </button>
        </div>
        <div *ngIf="error" class="mt-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
          <p class="font-medium">Connection Error</p>
          <p>{{ error }}</p>
        </div>
      </div>
      <div class="mt-8 pt-4 border-t border-gray-200">
        <button 
          (click)="returnToAppointment()" 
          class="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Return to Appointment
        </button>
      </div>
    </div>
  `,
})
export class GoogleFitComponent implements OnInit {
  private authService = inject(AuthService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private googleFitService = inject(GoogleFitService)

  loading = true
  isConnected = false
  isSyncing = false
  error: string | null = null
  returnUrl: string = '/app/new-appointment'
  appointmentComponent: any = null

  // Google OAuth configuration
  private readonly GOOGLE_FIT_CLIENT_ID = environment.googleFit?.clientId
  private readonly GOOGLE_FIT_REDIRECT_URI = environment.googleFit?.redirectUri
  private readonly GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
  ]

  ngOnInit(): void {
    // Get the return URL and appointment component from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.appointmentComponent = navigation.extras.state['appointmentComponent'];
      this.returnUrl = navigation.extras.state['returnUrl'] || this.returnUrl;
    }
    this.checkConnection();
  }

  async checkConnection(): Promise<void> {
    try {
      this.loading = true;
      this.isConnected = await this.googleFitService.hasLinkedGoogleFit();
    } catch (error) {
      console.error('Error checking Google Fit connection:', error);
      this.error = 'Failed to check Google Fit connection status.';
    } finally {
      this.loading = false;
    }
  }

  async connect(): Promise<void> {
    try {
      this.error = null;
      await this.googleFitService.initiateGoogleFitAuth();
      // The page will redirect to Google's OAuth page
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
      this.error = 'Failed to connect to Google Fit. Please try again.';
    }
  }

  async syncData(): Promise<void> {
    try {
      this.error = null;
      this.isSyncing = true;
      const success = await this.googleFitService.fetchAndStoreAllData();
      if (!success) {
        this.error = 'Failed to sync data. Please try again.';
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      this.error = 'An error occurred while syncing data.';
    } finally {
      this.isSyncing = false;
    }
  }

  async disconnect(): Promise<void> {
    // TODO: Implement disconnect using an edge function to delete provider tokens
    alert('Disconnect is not implemented yet.');
  }

  returnToAppointment(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
