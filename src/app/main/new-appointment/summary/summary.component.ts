import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../services/appointments/appointments.service';

interface PersonalInfo {
  title: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  acceptTerms: boolean;
  allowTreatmentInfo: boolean;
  allowReminders: boolean;
}

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
  standalone: true,
})
export class SummaryComponent {
  private appointmentsService = inject(AppointmentsService);

  @Input() appointmentType: string | undefined;
  @Input() prettyAppointmentType: string | undefined;
  @Input() appointmentInfo:
    | {
        mode: 'on-site' | 'video';
        practice: string;
        doctor: string;
        date: Date;
      }
    | undefined;

  @Input() personalInfo: PersonalInfo | undefined;

  @Output() bookAppointment = new EventEmitter<void>();
  @Output() cancelBooking = new EventEmitter<void>();

  get appointmentDate(): string {
    return this.appointmentInfo?.date.toLocaleDateString() || '';
  }

  get appointmentTime(): string {
    return (
      this.appointmentInfo?.date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }) || ''
    );
  }

  get appointmentMode(): string {
    return this.appointmentInfo?.mode === 'on-site'
      ? 'In-person visit'
      : 'Video consultation';
  }

  get fullName(): string {
    if (!this.personalInfo) return '';

    const parts = [];
    if (this.personalInfo.title) parts.push(this.personalInfo.title);
    if (this.personalInfo.salutation) parts.push(this.personalInfo.salutation);
    if (this.personalInfo.firstName) parts.push(this.personalInfo.firstName);
    if (this.personalInfo.lastName) parts.push(this.personalInfo.lastName);

    return parts.join(' ');
  }

  get dateOfBirth(): string {
    if (!this.personalInfo) return '';
    const { birthDay, birthMonth, birthYear } = this.personalInfo;
    if (!birthDay || !birthMonth || !birthYear) return '';

    return `${birthDay}/${birthMonth}/${birthYear}`;
  }

  async onBookNow(): Promise<void> {
    if (this.appointmentInfo) {
      try {
        // Format date as YYYY-MM-DD for the database
        const date = this.appointmentInfo.date.toISOString().split('T')[0];

        // Format time as HH:MM:SS for the database
        const timeStr = this.appointmentInfo.date.toTimeString().split(' ')[0];

        // Save the appointment to the database
        await this.appointmentsService.saveAppointment({
          practice: this.appointmentInfo.practice,
          doctor: this.appointmentInfo.doctor,
          reason: this.prettyAppointmentType || 'Consultation',
          date: date,
          time: timeStr,
        });

        // Emit event to parent component for navigation
        this.bookAppointment.emit();
      } catch (error) {
        console.error('Error saving appointment:', error);
        alert('Failed to save appointment. Please try again.');
      }
    } else {
      alert('Appointment details are missing.');
    }
  }

  onCancel(): void {
    this.cancelBooking.emit();
  }
}
