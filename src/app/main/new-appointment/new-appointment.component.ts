import { Component, computed, signal } from '@angular/core';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './appointment-type/fields';
import { NgClass } from '@angular/common';
import { TimePlacePickerComponent } from './time-place-picker/time-place-picker.component';
import { ConfirmAppointmentComponent } from './confirm-appointment/confirm-appointment.component';
import { RelevantDocumentsComponent } from './relevant-documents/relevant-documents.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';

@Component({
  selector: 'app-new-appointment',
  imports: [
    AppointmentTypeComponent,
    NgClass,
    TimePlacePickerComponent,
    ConfirmAppointmentComponent,
    RelevantDocumentsComponent,
    PersonalInformationComponent,
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
  relevantDocuments$ = signal<boolean>(false);

  // Signal for personal data step
  personalData$ = signal<boolean>(false);

  currentStep$ = computed<0 | 1 | 2 | 3 | 4 | 5>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time (appointmentType selected, but not yet date/time)
    // Step 2: Confirm appointment
    // Step 3: Relevant documents
    // Step 4: Personal information
    // Step 5: Authentication
    if (!this.appointmentType$()) {
      return 0;
    }
    if (!this.appointmentInfo$()) {
      return 1;
    }

    if (!this.relevantDocuments$()) {
      return 2;
    }
    if (!this.personalData$()) {
      return 3;
    }
    // Step 4 when personal data completed
    return 4;
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
      label: 'Personal information',
      description: () => 'Provide your personal information.',
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
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
    }
    if (step === 1) {
      this.appointmentInfo$.set(undefined);
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
    }
    if (step === 2) {
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
    }
    if (step === 3) {
      this.personalData$.set(false);
    }
    // Expand this as you add more step logic
  }

  confirmAppointment() {
    // Move to the relevant documents step
    this.relevantDocuments$.set(true);
    console.log('Appointment confirmed! Moving to relevant documents step.', {
      type: this.appointmentType$(),
      info: this.appointmentInfo$(),
    });
  }

  declineAppointment() {
    // Reset appointment data and go back to date/time selection
    this.goToStep(1);
  }

  completeRelevantDocuments() {
    console.log(
      'Relevant documents completed! Moving to personal information step.'
    );
    // Move to the personal information step by setting personalData$ to true
    this.personalData$.set(true);
  }

  // Method to complete the personal data step
  completePersonalData() {
    console.log('Personal information completed!');
    this.personalData$.set(true);
    // Here you would typically save the personal data
    // and potentially navigate to a confirmation page
  }
}
