import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GoogleFitService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  constructor() { }

  /**
   * Initiate Google OAuth flow for Google Fit access
   * This preserves the anonymous identity while linking Google access
   */
  async initiateGoogleFitAuth(): Promise<void> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Make sure user has anonymous account first
      const userId = this.authService.userId();
      if (!userId) {
        await this.authService.signInAnonymously();
      }

      // Store current URL to return after auth
      localStorage.setItem('googlefit_redirect', window.location.pathname);
      
      // Initiate OAuth with Google, requesting Google Fit scopes
      // This will redirect the user to Google's consent page
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read'
          },
          // This parameter ensures we link rather than replace the identity
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/app/googlefit/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error initiating Google Fit auth:', error);
      throw error;
    }
  }

  /**
   * Handle the OAuth callback and link the Google identity
   */
  async handleAuthCallback(): Promise<boolean> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Get the auth callback information
      let { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error retrieving session:', error);
        throw error;
      }
      
      if (!session) {
        console.error('No session found');
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          throw new Error('No session found and refresh failed');
        }
        session = refreshData.session;
      }
      
      // Check if we have provider token in the session
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;
      
      if (!providerToken) {
        console.error('No provider token found');
        throw new Error('No provider token found');
      }

      // Store provider tokens securely in user metadata via server function
      // Pass undefined instead of null for the refresh token
      await this.storeProviderTokens(providerToken, providerRefreshToken || undefined);
      
      // Redirect back to the original page
      const redirectPathFromStorage = localStorage.getItem('googlefit_redirect');
      localStorage.removeItem('googlefit_redirect');
      
      // Navigate to the saved path or default to dashboard
      const redirectPath = redirectPathFromStorage !== null ? redirectPathFromStorage : '/app/dashboard';
      this.router.navigateByUrl(redirectPath);
      
      return true;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    }
  }

  /**
   * Store provider tokens securely in user metadata via server function
   */
  private async storeProviderTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Call a secure edge function to store the tokens
      // This keeps tokens off the client
      const { error } = await supabase.functions.invoke('store-provider-tokens', {
        body: {
          provider: 'google',
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 3600 * 1000 // 1 hour from now
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error storing provider tokens:', error);
      throw error;
    }
  }

  /**
   * Check if user has linked Google Fit
   */
  async hasLinkedGoogleFit(): Promise<boolean> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Call edge function to check if user has valid tokens
      const { data, error } = await supabase.functions.invoke('check-provider-tokens', {
        body: { provider: 'google' }
      });

      if (error) {
        throw error;
      }

      return data?.hasValidTokens || false;
    } catch (error) {
      console.error('Error checking Google Fit link:', error);
      return false;
    }
  }

  /**
   * Fetch and store all Google Fit data for the user
   * This is the main method to call when you want to fetch and store all data
   */
  async fetchAndStoreAllData(): Promise<boolean> {
    try {
      // Calculate time range (last 30 days)
      const endTime = Date.now();
      const startTime = endTime - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Use edge function to fetch data securely
      const { data, error } = await supabase.functions.invoke('fetch-googlefit-data', {
        body: {
          startTime,
          endTime
        }
      });

      if (error) {
        throw error;
      }

      // Store the retrieved data
      if (data) {
        await this.storeHealthData({
          stepCount: data.stepCount,
          activityData: data.activityData,
          heartRateData: data.heartRateData,
          sleepData: data.sleepData,
          fetchedAt: new Date().toISOString(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error fetching and storing Google Fit data:', error);
      return false;
    }
  }

  /**
   * Store health data in Supabase
   */
  private async storeHealthData(healthData: any): Promise<void> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      // Get the current user ID
      const userId = this.authService.userId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Store the data in the health_data table
      const { error } = await supabase
        .from('health_data')
        .upsert({
          user_id: userId,
          data: healthData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      console.log('Health data stored successfully');
    } catch (error) {
      console.error('Error storing health data:', error);
      throw error;
    }
  }

  /**
   * Maps Google Fit activity type IDs to human-readable names
   * Used by the edge function for consistent activity naming
   */
  private getActivityName(activityType: number): string {
    const activityMap: {[key: number]: string} = {
      1: 'Biking',
      7: 'Walking',
      8: 'Running',
      9: 'Still (not moving)',
      10: 'Tilting (sudden device gravity change)',
      11: 'Unknown',
      72: 'Sleep',
      73: 'Light sleep',
      74: 'Deep sleep',
      75: 'REM sleep',
      76: 'Awake during sleep cycle',
      77: 'Swimming',
      82: 'Strength training',
      108: 'High-intensity interval training',
      // Add more mappings as needed
    };
    
    return activityMap[activityType] || `Activity (${activityType})`;
  }

  async refreshSession(): Promise<void> {
    try {
      const supabase = this.supabaseService.supabase;
      if (!supabase) {
        throw new Error('Supabase client not found');
      }

      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        throw error;
      }
      
      if (!data.session) {
        console.error('No session found after refresh');
        throw new Error('No session found after refresh');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  }
} 