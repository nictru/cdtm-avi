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
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Google Fit Integration</h2>
      
      <div *ngIf="loading" class="flex justify-center my-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div *ngIf="!loading">
        <div *ngIf="isConnected" class="mb-4">
          <div class="flex items-center mb-2">
            <span class="inline-flex items-center justify-center w-6 h-6 mr-2 bg-green-500 rounded-full">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </span>
            <span class="text-green-700 font-medium">Connected to Google Fit</span>
          </div>
          
          <p class="text-gray-600 mb-4">Your Google Fit data is being synced securely.</p>
          
          <div class="flex flex-col space-y-2">
            <button 
              (click)="syncData()" 
              [disabled]="isSyncing"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center">
              <span *ngIf="isSyncing" class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              {{ isSyncing ? 'Syncing...' : 'Sync Data Now' }}
            </button>
            
            <button 
              (click)="disconnect()" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Disconnect Google Fit
            </button>
          </div>
        </div>
        
        <div *ngIf="!isConnected" class="mb-4">
          <div class="flex items-center mb-2">
            <span class="inline-flex items-center justify-center w-6 h-6 mr-2 bg-yellow-500 rounded-full">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </span>
            <span class="text-gray-700 font-medium">Not connected to Google Fit</span>
          </div>
          
          <p class="text-gray-600 mb-4">
            Connect your Google Fit account to automatically import your health data.
            Your anonymous identity will be preserved.
          </p>
          
          <button 
            (click)="connect()" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Connect Google Fit
          </button>
        </div>
        
        <div *ngIf="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>
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

  // Google OAuth configuration
  private readonly GOOGLE_FIT_CLIENT_ID = environment.googleFit.clientId
  private readonly GOOGLE_FIT_REDIRECT_URI = environment.googleFit.redirectUri
  private readonly GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
  ]

  ngOnInit(): void {
    this.checkConnection()
  }

  async checkConnection(): Promise<void> {
    try {
      this.loading = true
      this.isConnected = await this.googleFitService.hasLinkedGoogleFit()
    } catch (error) {
      console.error('Error checking Google Fit connection:', error)
      this.error = 'Failed to check Google Fit connection status.'
    } finally {
      this.loading = false
    }
  }

  async connect(): Promise<void> {
    try {
      this.error = null
      await this.googleFitService.initiateGoogleFitAuth()
      // The page will redirect to Google's OAuth page
    } catch (error) {
      console.error('Error connecting to Google Fit:', error)
      this.error = 'Failed to connect to Google Fit. Please try again.'
    }
  }

  async syncData(): Promise<void> {
    try {
      this.error = null
      this.isSyncing = true
      const success = await this.googleFitService.fetchAndStoreAllData()
      
      if (success) {
        // Show success message or update UI
      } else {
        this.error = 'Failed to sync data. Please try again.'
      }
    } catch (error) {
      console.error('Error syncing data:', error)
      this.error = 'An error occurred while syncing data.'
    } finally {
      this.isSyncing = false
    }
  }

  async disconnect(): Promise<void> {
    // This would be implemented in a real app
    alert('This feature is not implemented in this demo.')
    // In a real implementation, you would:
    // 1. Delete the tokens from the provider_tokens table
    // 2. Update the UI to show disconnected state
  }
}
