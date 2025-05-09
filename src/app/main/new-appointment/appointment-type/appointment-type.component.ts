import { Component, output } from '@angular/core';

@Component({
  selector: 'app-appointment-type',
  imports: [],
  templateUrl: './appointment-type.component.html',
  styleUrl: './appointment-type.component.css',
  standalone: true,
})
export class AppointmentTypeComponent {
  appointmentType = output<
    | 'routine'
    | 'psychologist'
    | 'emergency'
    | 'unwell'
    | 'specialist'
    | undefined
  >();
}
