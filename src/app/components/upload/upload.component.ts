import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  private storageService = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);

  @Input() bucket: string = 'patient-docs';
  @Output() filesUploaded = new EventEmitter<string[]>();

  uploadedFiles: File[] = [];
  isDragging = false;
  isUploading = false;
  uploadProgress: { [key: string]: number } = {};
  uploadedUrls: string[] = [];
  uploadedFileIds: string[] = []; // To track which files have been uploaded
  showCameraOptions = false;
  showCamera = false;
  showQRCode = false;
  isCapturing = false;
  previewImage: string | null = null;
  qrCodeUrl = '';
  currentStream: MediaStream | null = null;
  @ViewChild('cameraVideo') cameraVideoRef!: ElementRef<HTMLVideoElement>;

  constructor(private supabaseService: SupabaseService) {}

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
    // Ensure user is authenticated before upload
    let userId = this.storageService.authService.userId();
    if (!userId) {
      // Try to sign in anonymously
      await this.storageService.authService.signInAnonymously();
      userId = this.storageService.authService.userId();
      if (!userId) {
        alert('Could not authenticate user. Please try again.');
        return;
      }
    }
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

        try {
          // Upload the file with progress callback
          const data = await this.storageService.uploadFile(
            this.bucket,
            file,
            (progress: number) => {
              this.uploadProgress[file.name] = progress;
              // Force change detection to update UI
              this.cdr.detectChanges();
            }
          );

          // Get the public URL for the file
          const publicUrl = await this.storageService.getPublicUrl(
            this.bucket,
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

      // Emit the uploaded URLs
      this.filesUploaded.emit(this.uploadedUrls);
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

  // Open device camera
  openCamera(): void {
    // Check if the browser supports mediaDevices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Create a hidden video element if it doesn't exist
      let video = document.createElement('video');
      video.style.display = 'none';
      document.body.appendChild(video);

      // Create a canvas element for the snapshot
      let canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      document.body.appendChild(canvas);

      // Request camera access
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          // Show a modal or UI for taking the picture
          // This is a simplified version - in a real app, you'd create a proper UI
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100%';
          modal.style.height = '100%';
          modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
          modal.style.zIndex = '1000';
          modal.style.display = 'flex';
          modal.style.flexDirection = 'column';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';

          // Create video preview
          const videoPreview = document.createElement('video');
          videoPreview.srcObject = stream;
          videoPreview.style.maxWidth = '80%';
          videoPreview.style.maxHeight = '60vh';
          videoPreview.style.borderRadius = '8px';
          videoPreview.autoplay = true;

          // Create capture button
          const captureBtn = document.createElement('button');
          captureBtn.textContent = 'Take Photo';
          captureBtn.style.margin = '20px';
          captureBtn.style.padding = '10px 20px';
          captureBtn.style.borderRadius = '4px';
          captureBtn.style.backgroundColor = '#3f51b5';
          captureBtn.style.color = 'white';
          captureBtn.style.border = 'none';
          captureBtn.style.cursor = 'pointer';

          // Create close button
          const closeBtn = document.createElement('button');
          closeBtn.textContent = 'Cancel';
          closeBtn.style.padding = '10px 20px';
          closeBtn.style.borderRadius = '4px';
          closeBtn.style.backgroundColor = '#f44336';
          closeBtn.style.color = 'white';
          closeBtn.style.border = 'none';
          closeBtn.style.cursor = 'pointer';

          // Add elements to modal
          modal.appendChild(videoPreview);
          const btnContainer = document.createElement('div');
          btnContainer.style.display = 'flex';
          btnContainer.style.gap = '10px';
          btnContainer.appendChild(captureBtn);
          btnContainer.appendChild(closeBtn);
          modal.appendChild(btnContainer);
          document.body.appendChild(modal);

          // Handle capture button click
          captureBtn.onclick = () => {
            // Set canvas dimensions to match video
            canvas.width = videoPreview.videoWidth;
            canvas.height = videoPreview.videoHeight;

            // Draw the video frame to the canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

              // Convert canvas to blob
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    // Create a File object from the blob
                    const now = new Date();
                    const fileName = `photo_${now.getFullYear()}${
                      now.getMonth() + 1
                    }${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
                    const file = new File([blob], fileName, {
                      type: 'image/jpeg',
                    });

                    // Add the file to the uploadedFiles array
                    this.uploadedFiles.push(file);
                    // Initialize progress tracking for this file
                    this.uploadProgress[file.name] = 0;
                  }

                  // Clean up
                  stopStreamAndRemoveModal(stream, modal);
                },
                'image/jpeg',
                0.95
              );
            }
          };

          // Handle close button click
          closeBtn.onclick = () => {
            stopStreamAndRemoveModal(stream, modal);
          };

          // Helper function to clean up
          const stopStreamAndRemoveModal = (
            stream: MediaStream,
            modal: HTMLElement
          ) => {
            // Stop all video streams
            stream.getTracks().forEach((track) => track.stop());

            // Remove modal
            document.body.removeChild(modal);

            // Clean up hidden elements
            if (document.body.contains(video)) document.body.removeChild(video);
            if (document.body.contains(canvas))
              document.body.removeChild(canvas);
          };
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
          alert('Could not access camera. Please check camera permissions.');
        });
    } else {
      alert(
        'Your browser does not support camera access. Please use the file upload option instead.'
      );
    }
  }

  showCameraOptionsDialog() {
    this.showCameraOptions = true;
  }

  openDirectCamera() {
    this.showCameraOptions = false;
    this.showCamera = true;
    this.initializeCamera();
  }

  showQRCodeOption() {
    this.showCameraOptions = false;
    this.showQRCode = true;
  }

  async initializeCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.currentStream = stream;
      // Use the ViewChild reference to set the video source
      if (this.cameraVideoRef && this.cameraVideoRef.nativeElement) {
        this.cameraVideoRef.nativeElement.srcObject = stream;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check camera permissions.');
    }
  }

  captureImage() {
    if (!this.currentStream) return;
    const video = document.querySelector('video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.previewImage = canvas.toDataURL('image/jpeg');
      this.isCapturing = true;
    }
  }

  async retakePhoto() {
    this.previewImage = null;
    this.isCapturing = false;
    setTimeout(() => {
      this.initializeCamera();
    }, 100);
  }

  deletePhoto() {
    this.previewImage = null;
    this.isCapturing = false;
    this.showCamera = false;
    this.stopCamera();
  }

  async acceptPhoto() {
    if (!this.previewImage) return;
    try {
      const response = await fetch(this.previewImage);
      const blob = await response.blob();
      const now = new Date();
      const fileName = `photo_${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      this.uploadedFiles.push(file);
      this.uploadProgress[file.name] = 0;
      this.previewImage = null;
      this.isCapturing = false;
      setTimeout(() => {
        this.initializeCamera();
      }, 100);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    }
  }

  public stopCamera(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  useSmartphoneOption() {
    this.showCameraOptions = false;
    alert('To use your smartphone, please upload photos from your phone or use a future QR code feature.');
  }
}
