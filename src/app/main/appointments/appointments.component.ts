import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AppointmentsService,
  Appointment,
} from '../../services/appointments/appointments.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})
export class AppointmentsComponent {
  private appointmentsService = inject(AppointmentsService);

  // Expose the resource directly
  appointments = this.appointmentsService.userAppointmentsResource;

  // Method to format date for display
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  // Method to format time for display
  formatTime(timeStr: string): string {
    // timeStr format is "HH:MM:SS"
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  // Check if appointment is upcoming (today or in the future)
  isUpcoming(appointment: Appointment): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  }

  // Helper method to check if there are any upcoming appointments
  hasUpcomingAppointments(): boolean {
    return this.appointments
      .value()
      .some((appointment) => this.isUpcoming(appointment));
  }

  // Helper method to check if there are any past appointments
  hasPastAppointments(): boolean {
    return this.appointments
      .value()
      .some((appointment) => !this.isUpcoming(appointment));
  }
}
