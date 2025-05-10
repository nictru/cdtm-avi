import { Component, computed, effect, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);

  isRoot = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url === '/' || this.router.url === '')
    ),
    { initialValue: this.router.url === '/' || this.router.url === '' }
  );

  constructor() {
    effect(() => {
      console.log('isRoot:', this.isRoot());
    });
  }
}
