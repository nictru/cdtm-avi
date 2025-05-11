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
  processed: boolean;
}

export interface MedicalRecord {
  patient_id: number;
  title: string;
  date_of_issue: string;
  hospital_or_agency: string;
  summary: string;
  document: number;
  doctor_name: string;
  doctor_email: string;
}

export interface Bloodtest {
  id: number;
  type: string;
  value: number;
  unit: string;
  patient_doc: number;
}

export interface DocumentWithMedicalRecord {
  // Document fields
  id: number;
  created_at: string;
  doc_name: string;
  doc_type: string;
  owner: string;
  text: string;
  processed: boolean;

  // Medical record fields in a nested object
  medical_record?: MedicalRecord;

  // Bloodtests in a nested array
  bloodtests?: Bloodtest[];
}

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService extends AbstractApiService {
  private authService = inject(AuthService);

  userDocsWithMedicalRecordsResource = resource({
    request: this.authService.userId,
    loader: async (params): Promise<DocumentWithMedicalRecord[]> => {
      if (!params.request) {
        throw new Error('User not authenticated');
      }

      console.log(
        'Loading user docs with medical records for user:',
        params.request
      );

      // Using our custom SQL function to get documents with medical records and bloodtests
      const { data, error } = await this._supabase.rpc(
        'get_documents_with_medical_records_and_bloodtests',
        { user_id: params.request }
      );

      if (error) {
        console.error('Error fetching medical records:', error);
        throw error;
      }

      // Handle the case where no data is returned or unexpected format
      if (!data) {
        console.warn('No data returned from the function');
        return [];
      }

      // Transform the JSONB result to our interface
      return data.map((item: any) => {
        const medicalRecord =
          item.medical_records && item.medical_records.length > 0
            ? item.medical_records[0]
            : undefined;

        return {
          id: item.id,
          created_at: item.created_at,
          doc_name: item.doc_name,
          doc_type: item.doc_type,
          owner: item.owner,
          text: item.text,
          processed: item.processed,
          medical_record: medicalRecord,
          bloodtests: item.bloodtests || [],
        };
      });
    },
    defaultValue: [],
  });

  // Subscription for patient_docs table
  docsSubscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    return this._supabase.channel(`medical_docs:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_docs',
        filter: `owner=eq.${userId}`,
      },
      () => this.userDocsWithMedicalRecordsResource.reload()
    );
  });

  // Subscription for patient_medical_record table
  medicalRecordsSubscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    // We need to listen to all changes on patient_medical_record
    // since we can't filter by owner (it's not in this table)
    return this._supabase.channel(`patient_medical_record:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'patient_medical_record',
      },
      () => this.userDocsWithMedicalRecordsResource.reload()
    );
  });

  // Subscription for bloodtests table
  bloodtestsSubscription = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return;

    return this._supabase.channel(`bloodtests:${userId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bloodtests',
      },
      () => this.userDocsWithMedicalRecordsResource.reload()
    );
  });

  // Effect to manage subscriptions
  private subscriptionEffect = effect(() => {
    const docsSub = this.docsSubscription();
    const medicalRecordsSub = this.medicalRecordsSubscription();
    const bloodtestsSub = this.bloodtestsSubscription();

    if (docsSub) {
      docsSub.subscribe();
    }

    if (medicalRecordsSub) {
      medicalRecordsSub.subscribe();
    }

    if (bloodtestsSub) {
      bloodtestsSub.subscribe();
    }
  });
}
