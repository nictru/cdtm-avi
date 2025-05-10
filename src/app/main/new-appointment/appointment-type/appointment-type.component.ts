import { Component, output } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { fields } from './fields';

@Component({
  selector: 'app-appointment-type',
  imports: [NgClass],
  templateUrl: './appointment-type.component.html',
  styleUrl: './appointment-type.component.css',
  standalone: true,
})
export class AppointmentTypeComponent {
  appointmentType = output<string>();
  public fields = fields;

  setAppointmentType(type: string) {
    this.appointmentType.emit(type);
  }
}
