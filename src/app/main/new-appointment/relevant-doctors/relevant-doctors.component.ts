import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relevant-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relevant-doctors.component.html',
  styleUrl: './relevant-doctors.component.css',
})
export class RelevantDoctorsComponent {
  // Input for controlling visibility of the modal
  isVisible = input<boolean>(false);

  // Output events for the two actions
  yes = output<void>();
  no = output<void>();

  // Method to handle 'Yes' button click
  onYes() {
    console.log('User approved requesting data from previous doctors');
    this.yes.emit();
  }

  // Method to handle 'No' button click
  onNo() {
    this.no.emit();
  }
}
