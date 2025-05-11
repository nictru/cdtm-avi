import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  messages: { text: string; sender: 'user' | 'assistant'; timestamp: Date }[] =
    [
      {
        text: "Hello! I'm your health assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date(),
      },
    ];

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim() === '') return;

    // Add user message
    this.messages.push({
      text: this.newMessage,
      sender: 'user',
      timestamp: new Date(),
    });

    // Clear input
    this.newMessage = '';

    // In a real app, you would send the message to a service here
    // and handle the response from the assistant

    // Simulate assistant response
    setTimeout(() => {
      this.messages.push({
        text: "I've received your message. In a real implementation, I would provide a helpful response based on your medical data.",
        sender: 'assistant',
        timestamp: new Date(),
      });
    }, 1000);
  }
}
