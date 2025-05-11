import { Component, computed, effect, inject, signal } from '@angular/core';
import { Message, ChatService } from '../../../services/chat/chat.service';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

// Define local Field interface
interface Field {
  id: string;
  name: string;
  fields: string[];
  icon?: string;
  description?: string;
}

// Mock fields data for display purposes
const fields: Field[] = [
  {
    id: 'general',
    name: 'General Visit',
    fields: ['symptoms', 'duration', 'severity'],
    icon: 'fa-stethoscope',
    description:
      'A general checkup or consultation for non-specific health concerns.',
  },
  {
    id: 'followup',
    name: 'Follow Up',
    fields: ['previous_visit_date', 'current_status', 'medication_effects'],
    icon: 'fa-calendar-check',
    description:
      'A follow-up appointment to discuss your progress and treatment plan.',
  },
  {
    id: 'specialist',
    name: 'Specialist Consultation',
    fields: ['referral_reason', 'specialist_type', 'medical_history'],
    icon: 'fa-user-md',
    description:
      'Consultation with a medical specialist for specific health concerns.',
  },
];

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgClass, FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  chatService = inject(ChatService);
  route = inject(ActivatedRoute);
  routeParams = toSignal(this.route.params);

  appointmentType$ = computed(() => {
    // Traverse up to find the 'new-appointment' segment, then get the next one
    let snapshot = this.route.snapshot;
    let parent = snapshot.parent;
    let appointmentType: string | null = null;
    while (parent) {
      if (parent.routeConfig && parent.routeConfig.path === 'new-appointment') {
        // The current snapshot is the child of 'new-appointment'
        appointmentType = snapshot.routeConfig?.path || null;
        break;
      }
      snapshot = parent;
      parent = parent.parent;
    }
    return appointmentType;
  });

  messages$ = signal<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your health assistant. How can I help you today?",
    },
  ]);

  messagesToShow$ = computed(() => {
    // Filter out system messages if needed
    return this.messages$().filter((msg) => msg.role !== 'system');
  });

  isFinished$ = computed(() => {
    return this.messages$().some((message) =>
      message.content.includes('#finished')
    );
  });

  currentMessage = signal<string>('');
  pendingAssistantMessage$ = signal<string | null>(null);

  selectedField = computed(() => {
    return fields.find((field: Field) => field.id === this.appointmentType$());
  });

  constructor() {
    // Effect to sync messages$ with sessionStorage if needed
    effect(() => {
      console.log('Chat status:', this.isFinished$() ? 'Finished' : 'Active');
    });
  }

  async sendMessage(message: string) {
    if (!message || message.trim() === '') return;

    // Add user message to the conversation
    this.messages$.update((messages) => [
      ...messages,
      { role: 'user', content: message },
    ]);

    // Clear input and set pending state
    this.currentMessage.set('');
    this.pendingAssistantMessage$.set('');

    try {
      // Get AI response with streaming updates
      const response = (await this.chatService.getAiResponse(
        this.messages$(),
        (partialResponse: string) => {
          this.pendingAssistantMessage$.set(partialResponse);
        }
      )) as string;

      // Add the final assistant response
      this.messages$.update((messages) => [
        ...messages,
        { role: 'assistant', content: response },
      ]);
      this.pendingAssistantMessage$.set(null);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add an error message
      this.messages$.update((messages) => [
        ...messages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      this.pendingAssistantMessage$.set(null);
    }
  }
}
