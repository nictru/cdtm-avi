import { Component, inject, output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css',
})
export class PersonalInformationComponent {
  private storageService = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);
  // Output event for when the user wants to go back
  goBack = output<void>();

  // Output event for when the user completes the form
  completeBooking = output<void>();

  // File upload properties
  uploadedFiles: File[] = [];
  isDragging = false;
  isUploading = false;
  uploadProgress: { [key: string]: number } = {};
  uploadedUrls: string[] = [];
  uploadedFileIds: string[] = []; // To track which files have been uploaded

  constructor(private supabaseService: SupabaseService) {}

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method to emit complete booking event
  async onCompleteBooking() {
    // Upload any remaining files before completing the booking
    if (
      this.uploadedFiles.length > 0 &&
      this.uploadedFileIds.length < this.uploadedFiles.length
    ) {
      await this.uploadFilesToSupabase();
    }

    // Here you would typically validate the form first
    this.completeBooking.emit();
  }

  // Handle file selection from input
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
    }
  }

  // Handle drag over event
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  // Handle drag leave event
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  // Handle drop event
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);

      // Filter files to only include PDFs and images
      const validFiles = files.filter(
        (file) => this.isImage(file) || this.isPdf(file)
      );

      if (validFiles.length !== files.length) {
        // Alert the user if some files were invalid
        alert(
          'Some files were skipped. Please upload only PDF or image files (JPG, JPEG, PNG).'
        );
      }

      if (validFiles.length > 0) {
        this.processFiles(validFiles);
      }
    }
  }

  // Process multiple files
  private processFiles(files: File[]) {
    // Add new files to the existing array
    this.uploadedFiles = [...this.uploadedFiles, ...files];

    // Initialize progress tracking for each file
    files.forEach((file) => {
      this.uploadProgress[file.name] = 0;
    });
  }

  // Format file size to human-readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Remove a file at specified index
  removeFile(index: number) {
    const file = this.uploadedFiles[index];

    // Check if this file was uploaded
    const wasUploaded = this.uploadedFileIds[index];

    // Remove from arrays
    this.uploadedFiles.splice(index, 1);

    // Also remove from progress tracking
    if (file && this.uploadProgress[file.name] !== undefined) {
      delete this.uploadProgress[file.name];
    }

    // If file was already uploaded to Supabase, delete it
    if (wasUploaded) {
      // For now, just remove from our tracking arrays
      // Actual deletion from storage would require additional API support
      this.uploadedUrls.splice(index, 1);
      this.uploadedFileIds.splice(index, 1);
    }
  }

  // Check if file is an image
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a PDF
  isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }

  // Get upload status text for a file
  getUploadStatus(file: File): string {
    const progress = this.uploadProgress[file.name] || 0;
    if (progress === 100) {
      return 'Uploaded';
    } else if (progress > 0) {
      return `Uploading: ${progress}%`;
    }
    return '';
  }

  // Check if a file has been uploaded
  isFileUploaded(index: number): boolean {
    return !!this.uploadedFileIds[index];
  }

  // Upload files to Supabase storage
  async uploadFilesToSupabase() {
    if (this.uploadedFiles.length === 0 || this.isUploading) return;

    this.isUploading = true;

    try {
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        const file = this.uploadedFiles[i];

        // Skip if already uploaded
        if (this.uploadedFileIds[i]) continue;

        // Update UI to show progress starting
        this.uploadProgress[file.name] = 10;
        this.cdr.detectChanges();

        // Determine storage bucket based on file type
        const bucket = 'patient-docs';

        try {
          // Upload the file with progress callback
          const data = await this.storageService.uploadFile(
            bucket,
            file,
            (progress: number) => {
              this.uploadProgress[file.name] = progress;
              // Force change detection to update UI
              this.cdr.detectChanges();
            }
          );

          // Get the public URL for the file
          const publicUrl = await this.storageService.getPublicUrl(
            bucket,
            data.path
          );

          // Store the URL and mark as uploaded
          this.uploadedUrls[i] = publicUrl;
          this.uploadedFileIds[i] = data.path; // Store the path as an ID

          // Ensure final progress is set to 100%
          this.uploadProgress[file.name] = 100;
          this.cdr.detectChanges();
        } catch (err) {
          console.error('Error uploading file:', err);
          this.uploadProgress[file.name] = 0;
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Error in upload process:', error);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  // Delete a file from Supabase storage
  async deleteFileFromSupabase(path: string) {
    // This would require additional API support in the StorageService
    console.log('Would delete file:', path);
  }
}
