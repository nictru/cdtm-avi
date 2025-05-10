import { Injectable, inject, signal, computed } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthSession, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AbstractApiService {
  private readonly router = inject(Router);

  _session = signal<AuthSession | null>(null);
  isLoggedIn = computed(() => !!this._session());
  isAnonymous = computed(() => this._session()?.user.is_anonymous);
  userId = computed(() => this._session()?.user.id);
  userEmail = computed(() => this._session()?.user.email);

  // Promise that resolves when the initial session check is complete
  private sessionInitialized: Promise<void>;

  constructor() {
    super();

    // Initialize session on service creation
    this.sessionInitialized = this.initSession();

    // Set up auth state change listener
    this.authChanges((event, session) => {
      this._session.set(session);
    });
  }

  /**
   * Initialize the session from Supabase on app startup
   * @returns Promise that resolves when session initialization is complete
   */
  async initSession(): Promise<void> {
    try {
      const { data } = await this._supabase.auth.getSession();
      this._session.set(data.session);
    } catch (error) {
      console.error('Error fetching initial session:', error);
      this._session.set(null);
    }
  }

  /**
   * Get a Promise that resolves when the initial session check is complete
   */
  async waitForInitialization(): Promise<void> {
    return this.sessionInitialized;
  }

  async signUp(email: string, password: string, returnUrl?: string) {
    const res = await this._supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    this._session.set(res.data.session);
    if (res.data.session) {
      this.redirectAfterAuth(returnUrl);
    }
    return res;
  }

  async signIn(email: string, password: string, returnUrl?: string) {
    const res = await this._supabase.auth.signInWithPassword({
      email,
      password,
    });
    this._session.set(res.data.session);
    if (res.data.session) {
      this.redirectAfterAuth(returnUrl);
    }
    return res;
  }

  /**
   * Sign in with a third-party OAuth provider
   * @param provider The OAuth provider to use (e.g., 'google', 'github')
   * @param link Whether to link this identity to the current user account (default: false)
   */
  async signInWithOAuth(
    provider: 'google' | 'github' | 'facebook' | 'twitter'
  ) {
    // Regular OAuth flow
    return await this._supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  /**
   * Sign in anonymously without requiring user credentials
   * @param returnUrl Optional explicit return URL
   * @returns The result of the sign-in operation
   */
  async signInAnonymously(returnUrl?: string) {
    const res = await this._supabase.auth.signInAnonymously();
    this._session.set(res.data.session);
    if (res.data.session && returnUrl) {
      this.redirectAfterAuth(returnUrl);
    }
    return res;
  }

  async signInWithToken(provider: string, token: string, returnUrl?: string) {
    const res = await this._supabase.auth.signInWithIdToken({
      provider,
      token,
    });

    this._session.set(res.data.session);
    if (res.data.session) {
      this.redirectAfterAuth(returnUrl);
    }

    return res;
  }

  async logout() {
    await this._supabase.auth.signOut();
    this._session.set(null);
    this.router.navigate(['/signup']);
  }

  get session() {
    return this._session;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this._supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Resend verification email to user
   * @param email The email address to send verification to
   * @returns The result of the operation
   */
  async resendVerificationEmail(email: string) {
    return await this._supabase.auth.resend({
      type: 'signup',
      email,
    });
  }

  /**
   * Handle OAuth callback and set session if successful
   * @param url The current URL including hash parameters from the OAuth provider
   * @returns The result of the operation
   */
  async handleAuthCallback(url: string) {
    try {
      // In implicit flow, Supabase automatically processes the hash
      // fragment and updates the session, so we just need to check
      // the session status
      const { data, error } = await this._supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
      } else if (data?.session) {
        console.log('Session retrieved successfully');
        this._session.set(data.session);
      } else {
        console.error('No session found');
      }

      return { data, error };
    } catch (error) {
      console.error('Error processing auth callback:', error);
      return {
        data: { session: null, user: null },
        error:
          error instanceof Error
            ? error
            : new Error('Unknown error during authentication'),
      };
    }
  }

  /**
   * Redirect user after successful authentication
   * @param returnUrl Optional explicit return URL
   */
  redirectAfterAuth(returnUrl?: string) {
    // Navigate to the return URL if provided, or to /app if not
    const redirectTo = returnUrl || '/app';
    this.router.navigate([redirectTo]);
  }
}
