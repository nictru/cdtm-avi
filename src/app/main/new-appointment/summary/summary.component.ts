import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  onBookNow(): void {
    this.bookAppointment.emit();
  }

  onCancel(): void {
    this.cancelBooking.emit();
  }
}
