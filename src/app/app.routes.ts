import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main/main.component';
import { StartComponent } from './main/start/start.component';

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
    ],
  },
];
