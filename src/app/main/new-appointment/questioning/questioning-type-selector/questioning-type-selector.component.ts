import { Component, output } from '@angular/core';

@Component({
  selector: 'app-questioning-type-selector',
  imports: [],
  templateUrl: './questioning-type-selector.component.html',
  styleUrl: './questioning-type-selector.component.css'
})
export class QuestioningTypeSelectorComponent {
  questioning_type = output<
    | 'chat'
    | 'voice'
    | 'video'
  >();
}

