import { Injectable, computed, effect, inject, resource } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export interface PatientDoc {
  id: number;
  created_at: string;
  doc_name: string;
  doc_type: string;
  owner: string;
  text: string;
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

    return this._supabase.channel(`patient_docs:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_docs',
        filter: `owner=eq.${userId}`,
      },
      () => this.userDocsResource.reload()
    );
  });

  private subscriptionEffect = effect(() => {
    const sub = this.subscription();
    if (sub) {
      sub.subscribe();
    }
  });
}
