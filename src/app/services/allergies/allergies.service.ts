import { Injectable, computed, effect, inject, resource } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export interface Allergy {
  id: number;
  patient_id: string;
  substance: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface CreateAllergyDto {
  substance: string;
  reaction?: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

@Injectable({
  providedIn: 'root',
})
export class AllergiesService extends AbstractApiService {
  private authService = inject(AuthService);

  userAllergiesResource = resource({
    request: this.authService.userId,
    loader: async (params): Promise<Allergy[]> => {
      if (!params.request) {
        throw new Error('User not authenticated');
      }

      console.log('Loading allergies for user:', params.request);

      // Now the patient_id is the same as the user UUID
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

  /**
   * Creates a new allergy for the current user
   * @param allergyData The allergy data to create
   * @returns A promise that resolves to the created allergy
   */
  createAllergy(allergyData: CreateAllergyDto): Promise<Allergy> {
    const userId = this.authService.userId();
    if (!userId) {
      return Promise.reject(new Error('User not authenticated'));
    }

    // Create the allergy with the user's UUID as the patient_id
    return this.request<Allergy>(
      this._supabase
        .from('allergies')
        .insert({
          patient_id: userId,
          substance: allergyData.substance,
          reaction: allergyData.reaction || '',
          severity: allergyData.severity,
        })
        .select()
        .single()
    ).then((result) => {
      // Reload the allergies list to reflect the new entry
      this.userAllergiesResource.reload();
      return result;
    });
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
