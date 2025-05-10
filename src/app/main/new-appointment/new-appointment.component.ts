import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { fields } from './questioning/fields';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-new-appointment',
  imports: [AppointmentTypeComponent, NgClass],
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

  currentStep$ = computed<0 | 1 | 2 | 3>(() => {
    // Step 0: Reason for visit (appointmentType not selected)
    // Step 1: Date and time (appointmentType selected, but not yet date/time)
    // Step 2: Personal information
    // Step 3: Authentication
    if (!this.appointmentType$()) {
      return 0;
    }
    // You can expand this logic to check for other step completions
    // For now, just move to step 1 if appointmentType is selected
    return 1;
  });

  goToStep(step: number) {
    // Example: only allow going back to step 0 (reset appointmentType)
    if (step === 0) {
      this.appointmentType$.set(undefined);
    }
    // Expand this as you add more step logic
  }
}
