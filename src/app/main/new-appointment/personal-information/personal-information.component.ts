import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

// Define the interface for form data
interface PersonalInfo {
  title: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  acceptTerms: boolean;
  allowTreatmentInfo: boolean;
  allowReminders: boolean;
}

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
})
export class PersonalInformationComponent {
  // Output event for when the user wants to go back
  goBack = output<void>();

  // Output event for when the user completes the form
  completeBooking = output<PersonalInfo>();

  // Form data using signals
  title = signal<string>('');
  salutation = signal<string>('');
  firstName = signal<string>('');
  lastName = signal<string>('');
  email = signal<string>('');
  phoneNumber = signal<string>('');
  birthDay = signal<string>('');
  birthMonth = signal<string>('');
  birthYear = signal<string>('');
  acceptTerms = signal<boolean>(false);
  allowTreatmentInfo = signal<boolean>(false);
  allowReminders = signal<boolean>(false);

  // Computed signal for the full personal info object
  personalInfo = computed<PersonalInfo>(() => ({
    title: this.title(),
    salutation: this.salutation(),
    firstName: this.firstName(),
    lastName: this.lastName(),
    email: this.email(),
    phoneNumber: this.phoneNumber(),
    birthDay: this.birthDay(),
    birthMonth: this.birthMonth(),
    birthYear: this.birthYear(),
    acceptTerms: this.acceptTerms(),
    allowTreatmentInfo: this.allowTreatmentInfo(),
    allowReminders: this.allowReminders(),
  }));

  // Title options as a signal
  titleOptions = signal<string[]>(['None', 'Dr.', 'Prof.', 'Prof. Dr.']);

  // Salutation options as a signal
  salutationOptions = signal<string[]>(['Ms.', 'Mr.', 'Diverse']);

  // Computed signal for email validation
  isEmailValid = computed(() => {
    if (!this.email()) return true; // Don't show error when empty
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.email());
  });

  // Computed signal for phone validation
  isPhoneValid = computed(() => {
    if (!this.phoneNumber()) return true; // Don't show error when empty
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(this.phoneNumber());
  });

  // Computed signal for date validation
  isDateValid = computed(() => {
    if (!this.birthDay() || !this.birthMonth() || !this.birthYear())
      return true; // Don't show error when empty

    const day = parseInt(this.birthDay());
    const month = parseInt(this.birthMonth());
    const year = parseInt(this.birthYear());

    if (
      isNaN(day) ||
      day < 1 ||
      day > 31 ||
      isNaN(month) ||
      month < 1 ||
      month > 12 ||
      isNaN(year) ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return false;
    }
    return true;
  });

  // Computed signal for form validation
  isFormValid = computed(() => {
    // Required fields validation
    if (
      !this.firstName() ||
      !this.lastName() ||
      !this.email() ||
      !this.phoneNumber() ||
      !this.birthDay() ||
      !this.birthMonth() ||
      !this.birthYear() ||
      !this.acceptTerms() ||
      !this.allowTreatmentInfo()
    ) {
      return false;
    }

    // Email, phone, and date validation
    return this.isEmailValid() && this.isPhoneValid() && this.isDateValid();
  });

  constructor(private supabaseService: SupabaseService) {}

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method to emit complete booking event
  onCompleteBooking() {
    if (this.isFormValid()) {
      console.log(
        'Form is valid, completing booking with:',
        this.personalInfo()
      );
      this.completeBooking.emit(this.personalInfo());
    } else {
      // Handle validation error
      console.error('Form validation failed');
      // You could display an error message to the user here
    }
  }
}
