import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  authService = inject(AuthService);

  redirectToApp() {
    this.authService.signInAnonymously();
  }
}
