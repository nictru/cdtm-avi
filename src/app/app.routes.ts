import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { StartComponent } from './main/start/start.component';
import { NewAppointmentComponent } from './main/new-appointment/new-appointment.component';
import { AppointmentsComponent } from './main/appointments/appointments.component';
import { MedicalDataComponent } from './main/medical-data/medical-data.component';
import { AppointmentTypeComponent } from './main/new-appointment/appointment-type/appointment-type.component';
import { EmergencyComponent } from './main/new-appointment/emergency/emergency.component';
import { QuestioningComponent } from './main/new-appointment/questioning/questioning.component';
import { QuestioningTypeSelectorComponent } from './main/new-appointment/questioning/questioning-type-selector/questioning-type-selector.component';
import { ChatComponent } from './main/new-appointment/questioning/chat/chat.component';
import { AudioComponent } from './main/new-appointment/questioning/audio/audio.component';
import { VideoComponent } from './main/new-appointment/questioning/video/video.component';
import { fields } from './main/new-appointment/questioning/fields';

const questioningChildren = [
  { path: '', component: QuestioningTypeSelectorComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'voice', component: AudioComponent },
  { path: 'video', component: VideoComponent },
];

const appointmentTypeRoutes = fields.map((field) => ({
  path: field.id,
  component: QuestioningComponent,
  children: questioningChildren,
}));

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
        children: [
          {
            path: '',
            component: AppointmentTypeComponent,
          },
          {
            path: 'emergency',
            component: EmergencyComponent,
          },
          {
            path: 'questioning',
            component: QuestioningComponent,
            children: questioningChildren,
          },
          ...appointmentTypeRoutes,
        ],
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
