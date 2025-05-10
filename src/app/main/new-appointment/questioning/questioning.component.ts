import { Component, signal } from '@angular/core';
import { QuestioningTypeSelectorComponent } from './questioning-type-selector/questioning-type-selector.component';
import { ChatComponent } from './chat/chat.component';
import { AudioComponent } from './audio/audio.component';
import { VideoComponent } from './video/video.component';

@Component({
  selector: 'app-questioning',
  standalone: true,
  imports: [QuestioningTypeSelectorComponent, ChatComponent, AudioComponent, VideoComponent],
  templateUrl: './questioning.component.html',
  styleUrl: './questioning.component.css',
})
export class QuestioningComponent {
  questioning_type = signal<'chat' | 'voice' | 'video' | undefined>(undefined);
}
