import {
  Injectable,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface PatientDoc {
  id: number;
  created_at: string;
  doc_name: string;
  doc_type: string;
  owner: string;
  text: string;
}

export interface EmbeddedSearchResult {
  distance: number;
  doc_id: number;
  page: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocsService extends AbstractApiService {
  private authService = inject(AuthService);

  userDocsResource = resource({
    request: this.authService.userId,
    loader: (params): Promise<PatientDoc[]> => {
      if (!params.request) {
        throw new Error('User not authenticated');
      }

      console.log('Loading user docs for user:', params.request);

      return this.request(
        this._supabase
          .from('patient_docs')
          .select('*')
          .eq('owner', params.request)
          .not('doc_type', 'is', null)
          .order('created_at', { ascending: false })
      );
    },
    defaultValue: [],
  });

  subscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    console.log('Subscribing to user docs for user:', userId);

    return this._supabase.channel(`patient_docs:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_docs',
        filter: `owner=eq.${userId}`,
      },
      () => {
        console.log('User docs changed');
        this.userDocsResource.reload();
      }
    );
  });

  private subscriptionEffect = effect(() => {
    const sub = this.subscription();
    if (sub) {
      sub.subscribe();
    }
  });

  /**
   * Performs semantic search using the embedded-search edge function
   * @param query The search query
   * @returns Promise with the search results or null if error
   */
  async embeddedSearch(query: string): Promise<EmbeddedSearchResult[] | null> {
    if (!query.trim()) {
      return [];
    }

    // Get the user's UUID
    const uuid = this.authService.userId();
    if (!uuid) {
      throw new Error('User not authenticated');
    }

    try {
      // Get the session token like ChatService does
      const {
        data: { session },
      } = await this._supabase.auth.getSession();
      const accessToken = session?.access_token || '';

      // Set a timeout for the request to prevent hanging
      const timeout = 15000; // 15 seconds

      // Function to create a fetch request with timeout
      const fetchWithTimeout = (
        url: string,
        options: RequestInit,
        ms: number
      ) => {
        const controller = new AbortController();
        const { signal } = controller;

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, ms);

        return fetch(url, { ...options, signal }).finally(() =>
          clearTimeout(timeoutId)
        );
      };

      // Set up a custom edge function invocation to better handle CORS
      const functionUrl = `${environment.supabaseUrl}/functions/v1/embedded-search`;

      // First try with OPTIONS request to check CORS setup
      const optionsResponse = await fetch(functionUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Log headers for debugging CORS issues
      console.log(
        'OPTIONS response headers:',
        Object.fromEntries(optionsResponse.headers.entries())
      );

      // Call the embedded-search edge function
      const response = await fetchWithTimeout(
        functionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query,
            uuid,
          }),
        },
        timeout
      );

      // Enhanced error handling with more details
      if (!response.ok) {
        // Try to get the error response as text
        let errorMessage = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMessage = errorJson.error || JSON.stringify(errorJson);
          } else {
            errorMessage = await response.text();
          }
        } catch (parseError) {
          errorMessage = `Failed to parse error response: ${parseError}`;
        }

        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorMessage}`
        );
      }

      // Try to handle different response formats
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Try to parse as JSON anyway
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Invalid response format: ${text}`);
        }
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      return null;
    }
  }
}
