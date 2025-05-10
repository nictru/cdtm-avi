import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { fields } from '../appointment-type/fields';

@Component({
  selector: 'app-confirm-appointment',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './confirm-appointment.component.html',
  styleUrl: './confirm-appointment.component.css',
})
export class ConfirmAppointmentComponent {
  // Events for Accept/Decline actions
  acceptAppointment = output<void>();
  declineAppointment = output<void>();

  // Inputs for appointment data
  appointmentType = input<string | undefined>(undefined);
  appointmentInfo = input<
    | {
        mode: 'on-site' | 'video';
        practice: string;
        doctor: string;
        date: Date;
      }
    | undefined
  >(undefined);

  // Available practices and doctors data (same as in time-place-picker)
  private availablePractices = [
    { id: null, name: 'No preference - All in Munich' },
    { id: 'practice1', name: 'Practice 1' },
    { id: 'practice2', name: 'Practice 2' },
  ];

  private availableDoctors = [
    { id: null, name: 'No preference' },
    { id: 'doctor1', name: 'Dr. Smith' },
    { id: 'doctor2', name: 'Dr. Jones' },
  ];

  // Method to get the appointment type icon
  getAppointmentTypeIcon(typeId: string): string {
    const field = fields.find((field) => field.id === typeId);
    return field?.icon || 'fa-question-circle';
  }

  // Method to get the appointment type name
  getAppointmentTypeName(typeId: string): string {
    const field = fields.find((field) => field.id === typeId);
    return field?.name || 'Unknown';
  }

  // Method to get the appointment type description
  getAppointmentTypeDescription(typeId: string): string {
    const field = fields.find((field) => field.id === typeId);
    return field?.description || 'No description available';
  }

  // Method to get practice name from ID
  getPracticeName(practiceId: string): string {
    const practice = this.availablePractices.find((p) => p.id === practiceId);
    return practice?.name || 'Unknown Practice';
  }

  // Method to get doctor name from ID
  getDoctorName(doctorId: string): string {
    const doctor = this.availableDoctors.find((d) => d.id === doctorId);
    return doctor?.name || 'Unknown Doctor';
  }

  // Method to emit accept event
  onAccept() {
    this.acceptAppointment.emit();
  }

  // Method to emit decline event
  onDecline() {
    this.declineAppointment.emit();
  }
}
