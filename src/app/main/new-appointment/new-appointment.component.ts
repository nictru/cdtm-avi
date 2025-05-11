import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './appointment-type/fields';
import { NgClass, CommonModule } from '@angular/common';
import { TimePlacePickerComponent } from './time-place-picker/time-place-picker.component';
import { RelevantDocumentsComponent } from './relevant-documents/relevant-documents.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { SummaryComponent } from './summary/summary.component';
import { Router } from '@angular/router';
import { GoogleFitService } from '../../services/google-fit.service';

@Component({
  selector: 'app-new-appointment',
  imports: [
    AppointmentTypeComponent,
    NgClass,
    CommonModule,
    TimePlacePickerComponent,
    RelevantDocumentsComponent,
    PersonalInformationComponent,
    SummaryComponent,
  ],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css',
  standalone: true,
})
export class NewAppointmentComponent implements OnInit {
  private router = inject(Router);
  private googleFitService = inject(GoogleFitService);
  
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

  // Signal for health data step
  healthData$ = signal<boolean>(false);

  // Signal to store personal information
  personalInfo$ = signal<any>(undefined);

  // Signal for completed all steps
  completed$ = signal<boolean>(false);

  currentStep = 1;
  isGoogleFitConnected = false;

  constructor() {}

  ngOnInit() {
    this.checkGoogleFitConnection();
  }

  async checkGoogleFitConnection() {
    try {
      this.isGoogleFitConnected = await this.googleFitService.hasLinkedGoogleFit();
    } catch (error) {
      console.error('Error checking Google Fit connection:', error);
    }
  }

  currentStep$ = computed<0 | 1 | 2 | 3 | 4 | 5>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time selection (includes confirmation)
    // Step 2: Relevant documents
    // Step 3: Personal information
    // Step 4: Health data (Google Fit)
    // Step 5: Summary and booking
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
    if (!this.healthData$()) {
      return 4;
    }
    if (!this.completed$()) {
      return 5;
    }
    // Final step is summary
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
      description: () => 'Connect your health devices (optional).',
    },
    {
      label: 'Summary',
      description: () => 'Review and confirm your appointment.',
    },
  ];

  goToStep(step: number) {
    // Example: only allow going back to step 0 (reset appointmentType)
    if (step === 0) {
      this.appointmentType$.set(undefined);
      this.appointmentInfo$.set(undefined);
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
      this.healthData$.set(false);
      this.personalInfo$.set(undefined);
      this.completed$.set(false);
    }
    if (step === 1) {
      this.appointmentInfo$.set(undefined);
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
      this.healthData$.set(false);
      this.personalInfo$.set(undefined);
      this.completed$.set(false);
    }
    if (step === 2) {
      this.relevantDocuments$.set(false);
      this.personalData$.set(false);
      this.healthData$.set(false);
      this.personalInfo$.set(undefined);
      this.completed$.set(false);
    }
    if (step === 3) {
      this.personalData$.set(false);
      this.healthData$.set(false);
      this.personalInfo$.set(undefined);
      this.completed$.set(false);
    }
    if (step === 4) {
      this.healthData$.set(false);
      this.completed$.set(false);
    }
    if (step === 5) {
      this.completed$.set(false);
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
    // Move to the personal information step
    this.relevantDocuments$.set(true);
    this.personalData$.set(false);
  }

  // Method to complete the personal data step
  completePersonalData(personalInfo: any) {
    console.log(
      'Personal information completed! Moving to health data step.',
      personalInfo
    );
    this.personalInfo$.set(personalInfo);
    this.personalData$.set(true);
    this.healthData$.set(false);
  }

  // Method to complete the health data step
  completeHealthDataStep() {
    console.log('Health data step completed! Moving to summary step.');
    this.healthData$.set(true);
    this.completed$.set(true);
  }

  // Method to handle booking confirmation
  bookAppointment() {
    console.log('Appointment booked successfully!', {
      type: this.appointmentType$(),
      prettyType: this.prettyAppointmentType$(),
      info: this.appointmentInfo$(),
      personalInfo: this.personalInfo$(),
      googleFitConnected: this.isGoogleFitConnected
    });

    // Navigate to appointments page after successful booking
    this.router.navigate(['/app']);
  }

  // Method to handle booking cancellation
  cancelBooking() {
    console.log('Going back to health data step');

    // Set completed$ to false to exit summary step
    this.completed$.set(false);
  }

  nextStep() {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }
  
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  connectGoogleFit() {
    // Store current state to return here after connection
    this.router.navigateByUrl('/app/googlefit', { 
      state: { 
        appointmentComponent: this,
        returnUrl: '/app/new-appointment'
      }
    });
  }
  
  // This will be called from the GoogleFit component after connection
  completeGoogleFitStep() {
    this.isGoogleFitConnected = true;
  }
  
  skipHealthDataStep() {
    this.completeHealthDataStep();
  }
  
  confirmAppointment() {
    // Process appointment confirmation
    // Then navigate to confirmation page
    this.router.navigateByUrl('/app/appointments');
  }
}
