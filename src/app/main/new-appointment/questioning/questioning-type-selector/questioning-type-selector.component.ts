import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-questioning-type-selector',
  imports: [],
  templateUrl: './questioning-type-selector.component.html',
  styleUrl: './questioning-type-selector.component.css',
  standalone: true,
})
export class QuestioningTypeSelectorComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  navigateToQuestioningType(type: 'chat' | 'voice' | 'video') {
    // Navigate to the questioning type while preserving the current path
    this.router.navigate([type], { relativeTo: this.route });
  }
}
