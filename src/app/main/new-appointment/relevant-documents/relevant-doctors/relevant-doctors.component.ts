import {
  Component,
  input,
  output,
  inject,
  effect,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalRecordsService } from '../../../../services/medical-records/medical-records.service';

@Component({
  selector: 'app-relevant-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relevant-doctors.component.html',
  styleUrl: './relevant-doctors.component.css',
})
export class RelevantDoctorsComponent {
  medicalRecordsService = inject(MedicalRecordsService);
  // Input for controlling visibility of the modal
  isVisible = input<boolean>(false);

  // Form values for new doctor
  newDoctorName = signal<string>('');
  newDoctorEmail = signal<string>('');

  doctors = computed(() => {
    const medicalRecords =
      this.medicalRecordsService.userDocsWithMedicalRecordsResource.value();
    return medicalRecords
      .map((record) => {
        return {
          name: record.medical_record?.doctor_name || '',
          email: record.medical_record?.doctor_email || '',
        };
      })
      .filter((doctor) => doctor.name || doctor.email);
  });

  customDoctors = signal<{ name: string; email: string }[]>([]);

  allDoctors = computed(() => {
    return [...this.doctors(), ...this.customDoctors()];
  });

  constructor() {
    effect(() => {
      console.log('doctors', this.doctors());
    });
  }

  // Input event handlers
  updateDoctorName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newDoctorName.set(input.value);
  }

  updateDoctorEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newDoctorEmail.set(input.value);
  }

  // Check if a new doctor can be added
  canAddDoctor(): boolean {
    // Either name or email should be provided
    return !!this.newDoctorName() || !!this.newDoctorEmail();
  }

  // Add a new custom doctor
  addDoctor(): void {
    if (!this.canAddDoctor()) return;

    this.customDoctors.update((doctors) => [
      ...doctors,
      {
        name: this.newDoctorName(),
        email: this.newDoctorEmail(),
      },
    ]);

    // Reset form
    this.newDoctorName.set('');
    this.newDoctorEmail.set('');
  }

  // Output events for the two actions
  yes = output<void>();
  no = output<void>();

  // Method to handle 'Yes' button click
  onYes() {
    console.log('User approved requesting data from previous doctors');
    this.yes.emit();
  }

  // Method to handle 'No' button click
  onNo() {
    this.no.emit();
  }
}
