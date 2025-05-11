import { Injectable, computed, effect, inject, resource } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export interface Allergy {
  id: number;
  patient_id: number;
  substance: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

@Injectable({
  providedIn: 'root',
})
export class AllergiesService extends AbstractApiService {
  private authService = inject(AuthService);

  userAllergiesResource = resource({
    request: this.authService.userId,
    loader: (params): Promise<Allergy[]> => {
      if (!params.request) {
        throw new Error('User not authenticated');
      }

      console.log('Loading allergies for user:', params.request);

      return this.request(
        this._supabase
          .from('allergies')
          .select('*')
          .eq('patient_id', params.request)
          .order('substance', { ascending: true })
      );
    },
    defaultValue: [],
  });

  saveAllergy(allergy: Omit<Allergy, 'id'>): Promise<Allergy> {
    return this.request(
      this._supabase
        .from('allergies')
        .insert({
          patient_id: parseInt(this.authService.userId() || '0'),
          substance: allergy.substance,
          reaction: allergy.reaction,
          severity: allergy.severity,
        })
        .select()
        .single()
    );
  }

  subscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    return this._supabase.channel(`allergies:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'allergies',
        filter: `patient_id=eq.${userId}`,
      },
      () => this.userAllergiesResource.reload()
    );
  });

  private subscriptionEffect = effect(() => {
    const sub = this.subscription();
    if (sub) {
      sub.subscribe();
    }
  });
}
