import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-questioning',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './questioning.component.html',
  styleUrl: './questioning.component.css',
})
export class QuestioningComponent {
  // Removed signal-based routing in favor of Angular Router
}
