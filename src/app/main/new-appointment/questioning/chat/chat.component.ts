import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ChatService, Message } from '../../../../services/chat/chat.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { fields } from '../fields';
import { CalendarComponent } from '../calendar/calendar.component';
@Component({
  selector: 'app-chat',
  imports: [NgClass, FormsModule, CalendarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
})
export class ChatComponent implements OnInit {
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

  requiredFields$ = computed(() => {
    const field = fields.find((field) => field.id === this.appointmentType$());
    return field?.fields || [];
  });

  messages$ = signal<Message[]>([]);
  messagesToShow$ = computed(() => {
    // Filter out the first message
    return this.messages$().slice(1);
  });

  isFinished$ = computed(() => {
    return this.messages$().some((message) =>
      message.content.includes('#finished')
    );
  });

  currentMessage = signal<string>('');
  pendingAssistantMessage$ = signal<string | null>(null);

  selectedField = computed(() => {
    return fields.find((field) => field.id === this.appointmentType$());
  });

  private getSessionStorageKey(): string {
    return `chat-messages-${this.appointmentType$()}`;
  }

  constructor() {
    // Effect to sync messages$ to sessionStorage
    effect(() => {
      const key = this.getSessionStorageKey();
      sessionStorage.setItem(key, JSON.stringify(this.messages$()));
    });
    effect(() => {
      console.log(this.isFinished$());
    });
  }

  ngOnInit(): void {
    // Try to load messages from sessionStorage
    const key = this.getSessionStorageKey();
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.messages$.set(parsed);
        }
      } catch {}
    }
    if (this.messages$().length === 0) {
      this.sendMessage(
        'Hello, I would like to make a ' +
          this.appointmentType$() +
          ' appointment'
      );
    }
  }

  async sendMessage(message: string) {
    this.messages$.update((messages) => [
      ...messages,
      { role: 'user', content: message },
    ]);
    this.currentMessage.set('');
    this.pendingAssistantMessage$.set('');

    const response = await this.chatService.getAiResponse(
      this.requiredFields$(),
      this.messages$(),
      (partialResponse) => {
        this.pendingAssistantMessage$.set(partialResponse);
      }
    );

    // Finalize the assistant message
    this.messages$.update((messages) => [
      ...messages,
      { role: 'assistant', content: response },
    ]);
    this.pendingAssistantMessage$.set(null);
  }
}
