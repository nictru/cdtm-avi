import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-mobile-camera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mobile-camera-container">
      <div class="camera-preview" *ngIf="!isCapturing">
        <video #videoElement autoplay playsinline></video>
        <div class="camera-controls">
          <button (click)="captureImage()">Take Photo</button>
          <button (click)="closeCamera()">Cancel</button>
        </div>
      </div>
      
      <div class="preview-container" *ngIf="isCapturing">
        <img [src]="previewImage" alt="Captured photo">
        <div class="preview-controls">
          <button (click)="retakePhoto()">Retake</button>
          <button (click)="acceptPhoto()">Accept</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-camera-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      display: flex;
      flex-direction: column;
    }

    .camera-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .camera-controls {
      position: absolute;
      bottom: 2rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
    }

    .camera-controls button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
    }

    .camera-controls button:first-child {
      background-color: #4caf50;
      color: white;
    }

    .camera-controls button:last-child {
      background-color: #f44336;
      color: white;
    }

    .preview-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #000;
    }

    .preview-container img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }

    .preview-controls {
      position: absolute;
      bottom: 2rem;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
    }

    .preview-controls button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 50px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
    }

    .preview-controls button:first-child {
      background-color: #ff9800;
      color: white;
    }

    .preview-controls button:last-child {
      background-color: #4caf50;
      color: white;
    }
  `]
})
export class MobileCameraComponent implements OnInit, OnDestroy {
  private stream: MediaStream | null = null;
  previewImage: string | null = null;
  isCapturing = false;
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.params['sessionId'];
    this.initializeCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async initializeCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer rear camera
      });
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check camera permissions.');
    }
  }

  captureImage() {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      this.previewImage = canvas.toDataURL('image/jpeg');
      this.isCapturing = true;
    }
  }

  retakePhoto() {
    this.previewImage = null;
    this.isCapturing = false;
  }

  async acceptPhoto() {
    if (!this.previewImage || !this.sessionId) return;

    try {
      // Convert base64 to blob
      const response = await fetch(this.previewImage);
      const blob = await response.blob();

      // Create a File object
      const now = new Date();
      const fileName = `photo_${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Upload to Supabase
      const data = await this.storageService.uploadFile(
        'patient-docs',
        file
      );

      // Reset camera state
      this.previewImage = null;
      this.isCapturing = false;
      this.stopCamera();

      // Notify success
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    }
  }

  closeCamera() {
    this.stopCamera();
    window.close(); // Close the mobile window
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
} 