import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  completeBooking = output<void>();

  // File upload properties
  uploadedFiles: File[] = [];
  isDragging = false;

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method to emit complete booking event
  onCompleteBooking() {
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
    this.uploadedFiles.splice(index, 1);
  }

  // Check if file is an image
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a PDF
  isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }
}
