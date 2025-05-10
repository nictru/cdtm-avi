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
  selectedFile: File | null = null;
  previewUrl: string | null = null;
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
      this.processFile(input.files[0]);
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
      const file = event.dataTransfer.files[0];
      // Check if the file type is allowed (PDF or image)
      if (this.isImage(file) || this.isPdf(file)) {
        this.processFile(file);
      } else {
        // Alert the user that the file type is not supported
        alert('Please upload only PDF or image files (JPG, JPEG, PNG).');
      }
    }
  }

  // Process the selected file
  private processFile(file: File) {
    this.selectedFile = file;

    // Create a preview for images
    if (this.isImage(this.selectedFile)) {
      this.createImagePreview();
    } else {
      // For PDFs, we don't create a preview URL
      this.previewUrl = null;
    }
  }

  // Remove the selected file
  removeFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // Check if file is an image
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a PDF
  isPdf(file: File): boolean {
    return file.type === 'application/pdf';
  }

  // Create image preview URL
  private createImagePreview() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
}
