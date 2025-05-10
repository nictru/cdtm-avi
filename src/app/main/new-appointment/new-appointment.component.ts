import { Component, computed, signal } from '@angular/core';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './appointment-type/fields';
import { NgClass } from '@angular/common';
import { TimePlacePickerComponent } from './time-place-picker/time-place-picker.component';
import { RelevantDocumentsComponent } from './relevant-documents/relevant-documents.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-new-appointment',
  imports: [
    AppointmentTypeComponent,
    NgClass,
    TimePlacePickerComponent,
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

  // Signal for relevant documents step
  relevantDocuments$ = signal<boolean>(false);

  // Signal for personal data step
  personalData$ = signal<boolean>(false);

  // Signal for Google Fit connection step
  googleFitConnected$ = signal<boolean>(false);

  constructor(private router: Router, private authService: AuthService) {
    // Check if Google Fit is already connected
    this.googleFitConnected$.set(this.authService.isGoogleFitConnected());
  }

  currentStep$ = computed<0 | 1 | 2 | 3 | 4 | 5>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time selection (includes confirmation)
    // Step 2: Relevant documents
    // Step 3: Personal information
    // Step 4: Google Fit connection
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
    if (!this.googleFitConnected$()) {
      return 4;
    }
    // Step 5 when Google Fit connection completed
    return 5;
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
      description: () =>
        this.appointmentInfo$()
          ? `${this.appointmentInfo$()?.date.toLocaleDateString()} at ${this.appointmentInfo$()?.date.toLocaleTimeString(
              [],
              { hour: '2-digit', minute: '2-digit' }
            )}`
          : 'Choose your preferred date and time.',
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
      label: 'Health data',
      description: () => 
        this.googleFitConnected$() 
          ? 'Google Fit connected'
          : 'Connect your Google Fit account.',
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
      this.googleFitConnected$.set(false);
    }
    if (step === 1) {
      this.appointmentInfo$.set(undefined);
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
      this.googleFitConnected$.set(false);
    }
    if (step === 2) {
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
      this.googleFitConnected$.set(false);
    }
    if (step === 3) {
      this.personalData$.set(false);
      this.googleFitConnected$.set(false);
    }
    if (step === 4) {
      this.googleFitConnected$.set(false);
    }
  }

  // When appointmentInfo is set (after confirmation), proceed to relevant documents
  handleAppointmentInfoSet(info: any) {
    this.appointmentInfo$.set(info);
    this.relevantDocuments$.set(true);
    console.log('Appointment confirmed! Moving to relevant documents step.', {
      type: this.appointmentType$(),
      info: this.appointmentInfo$(),
    });
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
    console.log('Personal information completed! Moving to Google Fit step.');
    this.personalData$.set(true);
    
    // Navigate to Google Fit connection step
    this.router.navigate(['/app/googlefit']);
  }

  // Method to complete the Google Fit step
  completeGoogleFitStep() {
    console.log('Google Fit step completed!');
    this.googleFitConnected$.set(true);
    // Here you would typically proceed to the final authentication step
  }
}
