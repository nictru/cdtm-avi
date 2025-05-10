import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './questioning/fields';
import { NgClass } from '@angular/common';
import { TimePlacePickerComponent } from './time-place-picker/time-place-picker.component';

@Component({
  selector: 'app-new-appointment',
  imports: [AppointmentTypeComponent, NgClass, TimePlacePickerComponent],
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

  currentStep$ = computed<0 | 1 | 2 | 3>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time (appointmentType selected, but not yet date/time)
    // Step 2: Personal information
    // Step 3: Authentication
    if (!this.appointmentType$()) {
      return 0;
    }
    if (!this.appointmentInfo$()) {
      return 1;
    }
    // You can expand this logic to check for other step completions
    // For now, just move to step 1 if appointmentType is selected
    return 2;
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
      label: 'Personal information',
      description: () => 'Enter your personal details.',
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
    }
    if (step === 1) {
      this.appointmentInfo$.set(undefined);
    }
    // Expand this as you add more step logic
  }
}
