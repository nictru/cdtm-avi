import { Component, computed, effect, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-time-place-picker',
  imports: [FormsModule],
  templateUrl: './time-place-picker.component.html',
  styleUrl: './time-place-picker.component.css',
})
export class TimePlacePickerComponent {
  appointmentInfo = output<{
    mode: 'on-site' | 'video';
    practice: string;
    doctor: string;
    date: Date;
  }>();

  mode = signal<'on-site' | 'video'>('on-site');
  practice = signal<string | null>(null);
  doctor = signal<string | null>(null);
  date = signal<Date>(new Date());
  dateString = computed(() => this.formatDateForInput(this.date()));
  time = signal<Date | null>(null);

  // Available options as signals
  availablePractices = signal<{ id: string | null; name: string }[]>([
    { id: null, name: 'No preference - All in Munich' },
    { id: 'practice1', name: 'Practice 1' },
    { id: 'practice2', name: 'Practice 2' },
  ]);

  availableDoctors = signal<{ id: string | null; name: string }[]>([
    { id: null, name: 'No preference' },
    { id: 'doctor1', name: 'Dr. Smith' },
    { id: 'doctor2', name: 'Dr. Jones' },
  ]);

  // All available times as Date objects
  availableTimes = signal<Date[]>([]);

  // Computed signals to split times
  morningTimes = computed(() =>
    this.availableTimes().filter((time) => time.getHours() < 12)
  );

  afternoonTimes = computed(() =>
    this.availableTimes().filter((time) => time.getHours() >= 12)
  );

  constructor() {
    // Initialize time slots
    this.availableTimes.set(this.generateTimeSlots());
  }

  // Format a Date as YYYY-MM-DD for the input element
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Update the date when dateString changes
  onDateInputChange(dateStr: string) {
    if (dateStr) {
      const newDate = new Date(dateStr);
      this.date.set(newDate);
    }
  }

  // Generate time slots as Date objects
  private generateTimeSlots(): Date[] {
    const timeStrings = [
      '09:10',
      '09:20',
      '09:40',
      '09:50',
      '10:00',
      '10:10',
      '10:30',
      '10:40',
      '10:50',
      '11:30',
      '12:10',
      '12:15',
      '12:30',
      '12:50',
      '13:50',
      '14:00',
      '14:20',
      '15:00',
      '15:15',
      '15:20',
      '15:30',
      '15:45',
    ];

    return timeStrings.map((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    });
  }

  // Format a date as HH:MM for display
  formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  // Get a random item from an array
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Get a random practice ID (excluding null)
  private getRandomPractice(): string {
    const practices = this.availablePractices()
      .filter((p) => p.id !== null)
      .map((p) => p.id as string);
    return this.getRandomItem(practices);
  }

  // Get a random doctor ID (excluding null)
  private getRandomDoctor(): string {
    const doctors = this.availableDoctors()
      .filter((d) => d.id !== null)
      .map((d) => d.id as string);
    return this.getRandomItem(doctors);
  }

  selectTime(t: Date) {
    this.time.set(t);
  }

  emitSelection() {
    const currentTime = this.time();

    if (currentTime) {
      // Ensure practice is not null
      let practiceValue = this.practice();
      if (practiceValue === null) {
        practiceValue = this.getRandomPractice();
        this.practice.set(practiceValue);
      }

      // Ensure doctor is not null
      let doctorValue = this.doctor();
      if (doctorValue === null) {
        doctorValue = this.getRandomDoctor();
        this.doctor.set(doctorValue);
      }

      // Create a new date with the selected date and time
      const selectedDate = new Date(this.date());
      selectedDate.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        0,
        0
      );

      this.appointmentInfo.emit({
        mode: this.mode(),
        practice: practiceValue,
        doctor: doctorValue,
        date: selectedDate,
      });
    }
  }
}
