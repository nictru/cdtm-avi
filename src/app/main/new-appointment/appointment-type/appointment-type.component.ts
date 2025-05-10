import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { fields } from '../questioning/fields';

@Component({
  selector: 'app-appointment-type',
  imports: [NgClass],
  templateUrl: './appointment-type.component.html',
  styleUrl: './appointment-type.component.css',
  standalone: true,
})
export class AppointmentTypeComponent {
  public fields = fields;

  constructor(private router: Router) {}

  navigateToAppointmentType(type: string) {
    this.router.navigate(['/app/new-appointment/' + type]);
  }
}
