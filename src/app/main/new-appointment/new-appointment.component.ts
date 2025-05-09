import { Component, signal } from '@angular/core';
import { AppointmentTypeComponent } from './appointment-type/appointment-type.component';
import { EmergencyComponent } from './emergency/emergency.component';
@Component({
  selector: 'app-new-appointment',
  imports: [AppointmentTypeComponent, EmergencyComponent],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css',
})
export class NewAppointmentComponent {
  appointmentType = signal<
    | 'routine'
    | 'psychologist'
    | 'emergency'
    | 'unwell'
    | 'specialist'
    | undefined
  >(undefined);
}
