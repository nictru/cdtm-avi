import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { StartComponent } from './main/start/start.component';
import { NewAppointmentComponent } from './main/new-appointment/new-appointment.component';
import { AppointmentsComponent } from './main/appointments/appointments.component';
import { MedicalDataComponent } from './main/medical-data/medical-data.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'app',
    component: MainComponent,
    children: [
      {
        path: '',
        component: StartComponent,
      },
      {
        path: 'new-appointment',
        component: NewAppointmentComponent,
      },
      {
        path: 'appointments',
        component: AppointmentsComponent,
      },
      {
        path: 'medical-data',
        component: MedicalDataComponent,
      },
    ],
  },
];
