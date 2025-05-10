import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { UploadComponent } from '../../../components/upload/upload.component';

@Component({
  selector: 'app-relevant-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadComponent],
  templateUrl: './relevant-documents.component.html',
  styleUrl: './relevant-documents.component.css',
})
export class RelevantDocumentsComponent {
  // Output event for when the user wants to go back
  goBack = output<void>();

  // Output event for when the user continues to the next step
  continueToNext = output<void>();

  // Store uploaded file URLs
  uploadedFileUrls: string[] = [];

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method to emit continue event
  onContinue() {
    // We don't need to process the files here, just emit the event
    this.continueToNext.emit();
  }

  // Handle files uploaded event from UploadComponent
  onFilesUploaded(fileUrls: string[]) {
    this.uploadedFileUrls = fileUrls;
    console.log('Files uploaded:', fileUrls);
  }
}
