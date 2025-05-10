import { Component, computed, signal } from '@angular/core';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './appointment-type/fields';
import { NgClass } from '@angular/common';
import { TimePlacePickerComponent } from './time-place-picker/time-place-picker.component';
import { ConfirmAppointmentComponent } from './confirm-appointment/confirm-appointment.component';
import { RelevantDocumentsComponent } from './relevant-documents/relevant-documents.component';

@Component({
  selector: 'app-new-appointment',
  imports: [
    AppointmentTypeComponent,
    NgClass,
    TimePlacePickerComponent,
    ConfirmAppointmentComponent,
    RelevantDocumentsComponent,
  ],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css',
  standalone: true,
})
export class NewAppointmentComponent {
  appointmentType$ = signal<string | undefined>(undefined);
  prettyAppointmentType$ = computed(() => {
    const appointmentType = this.appointmentType$();
    const field = fields.find((field) => field.id === appointmentType);
    return field?.name;
  });

  appointmentInfo$ = signal<
    | {
        mode: 'on-site' | 'video';
        practice: string;
        doctor: string;
        date: Date;
      }
    | undefined
  >(undefined);

  // Signal for personal information step
  personalInfo$ = signal<boolean>(false);

  currentStep$ = computed<0 | 1 | 2 | 3 | 4>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time (appointmentType selected, but not yet date/time)
    // Step 2: Confirm appointment
    // Step 3: Personal information
    // Step 4: Authentication
    if (!this.appointmentType$()) {
      return 0;
    }
    if (!this.appointmentInfo$()) {
      return 1;
    }
    if (!this.personalInfo$()) {
      return 2;
    }
    // Step 3 when personal info completed (for now we don't have the auth step yet)
    return 3;
  });

  steps = [
    {
      label: 'Reason for visit',
      description: () => {
        const appointmentType = this.appointmentType$();
        return appointmentType
          ? this.prettyAppointmentType$()
          : 'Select the reason for your appointment.';
      },
    },
    {
      label: 'Date and time',
      description: () => 'Choose your preferred date and time.',
    },
    {
      label: 'Confirm appointment',
      description: () => 'Review and confirm your appointment details.',
    },
    {
      label: 'Relevant documents',
      description: () => 'Upload any relevant documents for your appointment.',
    },
    {
      label: 'Authentication',
      description: () => 'Verify your identity to continue.',
    },
  ];

  goToStep(step: number) {
    // Example: only allow going back to step 0 (reset appointmentType)
    if (step === 0) {
      this.appointmentType$.set(undefined);
      this.appointmentInfo$.set(undefined);
      this.personalInfo$.set(false);
    }
    if (step === 1) {
      this.appointmentInfo$.set(undefined);
      this.personalInfo$.set(false);
    }
    if (step === 2) {
      this.personalInfo$.set(false);
    }
    // Expand this as you add more step logic
  }

  confirmAppointment() {
    // Move to the personal information step
    this.personalInfo$.set(true);
    console.log('Appointment confirmed! Moving to personal information step.', {
      type: this.appointmentType$(),
      info: this.appointmentInfo$(),
    });
  }

  declineAppointment() {
    // Reset appointment data and go back to date/time selection
    this.goToStep(1);
  }

  completePersonalInfo() {
    console.log('Document upload completed!');
    // Here you would typically handle the final step
    // For example, saving the appointment to a database
    // and navigating to a confirmation page
  }
}
