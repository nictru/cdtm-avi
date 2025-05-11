import { Injectable, computed, effect, inject, resource } from '@angular/core';
import { AbstractApiService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';

export interface Appointment {
  id: string;
  created_at: string;
  userId: string;
  practice: string;
  doctor: string;
  reason: string;
  date: string;
  time: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService extends AbstractApiService {
  private authService = inject(AuthService);

  userAppointmentsResource = resource({
    request: this.authService.userId,
    loader: (params): Promise<Appointment[]> => {
      if (!params.request) {
        throw new Error('User not authenticated');
      }

      console.log('Loading appointments for user:', params.request);

      return this.request(
        this._supabase
          .from('appointments')
          .select('*')
          .eq('userId', params.request)
          .order('date', { ascending: true })
      );
    },
    defaultValue: [],
  });

  saveAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'userId'>
  ): Promise<Appointment> {
    return this.request(
      this._supabase
        .from('appointments')
        .insert({
          practice: appointment.practice,
          doctor: appointment.doctor,
          reason: appointment.reason,
          date: appointment.date,
          time: appointment.time,
        })
        .select()
        .single()
    );
  }

  subscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    return this._supabase.channel(`appointments:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `userId=eq.${userId}`,
      },
      () => this.userAppointmentsResource.reload()
    );
  });

  private subscriptionEffect = effect(() => {
    const sub = this.subscription();
    if (sub) {
      sub.subscribe();
    }
  });
}
