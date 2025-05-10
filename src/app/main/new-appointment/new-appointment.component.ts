import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-new-appointment',
  imports: [RouterOutlet],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css',
  standalone: true,
})
export class NewAppointmentComponent {}
