import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-type',
  imports: [],
  templateUrl: './appointment-type.component.html',
  styleUrl: './appointment-type.component.css',
  standalone: true,
})
export class AppointmentTypeComponent {
  constructor(private router: Router) {}

  navigateToAppointmentType(
    type: 'routine' | 'psychologist' | 'emergency' | 'unwell' | 'specialist'
  ) {
    this.router.navigate(['/app/new-appointment/' + type]);
  }
}
