import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { UploadComponent } from '../../../components/upload/upload.component';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
})
export class PersonalInformationComponent {
  // Output event for when the user wants to go back
  goBack = output<void>();

  // Output event for when the user completes the form
  completeBooking = output<void>();

  // Store uploaded file URLs
  uploadedFileUrls: string[] = [];

  constructor(private supabaseService: SupabaseService) {}

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method to emit complete booking event
  async onCompleteBooking() {
    // Here you would typically validate the form first
    // And do something with the uploadedFileUrls
    this.completeBooking.emit();
  }

  // Handle files uploaded event from UploadComponent
  onFilesUploaded(fileUrls: string[]) {
    this.uploadedFileUrls = fileUrls;
    console.log('Files uploaded:', fileUrls);
  }
}
