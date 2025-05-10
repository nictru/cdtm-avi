import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly _supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        flowType: 'pkce',
      },
    }
  );

  get supabase() {
    return this._supabase;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractApiService {
  private supabaseService = inject(SupabaseService);
  protected readonly _supabase = this.supabaseService.supabase;

  protected async request<T>(request: any): Promise<T> {
    const { data, error } = await request;
    if (error) throw error;
    return data;
  }
}
