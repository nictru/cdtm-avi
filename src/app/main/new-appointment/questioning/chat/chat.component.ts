import { Component, inject, signal } from '@angular/core';
import { ChatService, Message } from '../../../../services/chat/chat.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [NgClass, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
})
export class ChatComponent {
  chatService = inject(ChatService);

  messages$ = signal<Message[]>([]);
  currentMessage = signal<string>('');

  streamingResponse = signal<string | undefined>(undefined);

  async sendMessage(message: string) {
    this.messages$.update((messages) => [
      ...messages,
      { role: 'user', content: message },
    ]);
    this.currentMessage.set('');

    const response = await this.chatService.getAiResponse(this.messages$());

    this.messages$.update((messages) => [
      ...messages,
      { role: 'assistant', content: response },
    ]);
  }
}
