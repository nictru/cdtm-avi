import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
        <video #videoElement autoplay playsinline muted></video>
        <div class="camera-controls compact">
          <button class="take-photo-btn compact" (click)="captureImage()">📸</button>
          <button class="cancel-btn compact" (click)="closeCamera()">✕</button>
        </div>
      </div>
      <div class="preview-container" *ngIf="isCapturing">
        <img [src]="previewImage" alt="Captured photo">
        <div class="preview-controls compact">
          <button class="retake-btn compact" (click)="retakePhoto()">Retake</button>
          <button class="add-btn compact" (click)="addPhoto()">Add</button>
        </div>
      </div>
      <div class="photos-list" *ngIf="pendingPhotos.length > 0">
        <h4>Photos to Upload ({{pendingPhotos.length}})</h4>
        <div class="photo-list-scroll">
          <div class="photo-item" *ngFor="let photo of pendingPhotos; let i = index">
            <img [src]="photo.preview" alt="Photo preview" class="photo-thumb">
            <button class="remove-photo-btn compact" (click)="removePhoto(i)">✕</button>
          </div>
        </div>
      </div>
      <button *ngIf="pendingPhotos.length > 0" class="upload-btn fixed" (click)="uploadAllPhotos()" [disabled]="isUploading">{{isUploading ? 'Uploading...' : 'Upload'}}</button>
      <div class="photos-list" *ngIf="uploadedPhotos.length > 0">
        <h4>Uploaded Photos ({{uploadedPhotos.length}})</h4>
        <div class="photo-list-scroll">
          <div class="photo-item" *ngFor="let photo of uploadedPhotos; let i = index">
            <img [src]="photo.url" alt="Photo preview" class="photo-thumb">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-camera-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(180deg, #18181b 0%, #23272f 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 1rem;
      overflow: auto;
    }
    .camera-preview {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100vw;
    }
    video {
      width: 92vw;
      max-width: 420px;
      height: 260px;
      object-fit: cover;
      border-radius: 1.25rem;
      background: #222;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      margin-bottom: 1.5rem;
    }
    .camera-controls.compact, .preview-controls.compact {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      width: 100vw;
      margin-bottom: 1rem;
    }
    .take-photo-btn.compact, .cancel-btn.compact, .retake-btn.compact, .add-btn.compact, .remove-photo-btn.compact {
      padding: 0.5rem 1.1rem;
      font-size: 1.1rem;
      border-radius: 1.5rem;
      font-weight: 600;
      min-width: 0;
      min-height: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .take-photo-btn.compact {
      background: linear-gradient(90deg, #6366f1 0%, #22d3ee 100%);
      color: #fff;
      border: none;
    }
    .cancel-btn.compact {
      background: #f43f5e;
      color: #fff;
      border: none;
    }
    .retake-btn.compact {
      background: #fbbf24;
      color: #fff;
      border: none;
    }
    .add-btn.compact {
      background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
      color: #fff;
      border: none;
    }
    .remove-photo-btn.compact {
      background: #ef4444;
      color: #fff;
      border: none;
      font-size: 1.2rem;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      margin-top: 0.25rem;
    }
    .photos-list {
      width: 100vw;
      max-width: 420px;
      background: #18181b;
      border-radius: 1.25rem;
      margin: 1.5rem auto 0 auto;
      padding: 1.5rem 1rem 1rem 1rem;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    }
    .photos-list h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #a5b4fc;
    }
    .photo-list-scroll {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    .photo-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      background: #23272f;
      border-radius: 0.75rem;
      padding: 0.5rem 0.5rem 0.75rem 0.5rem;
      min-width: 90px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .photo-thumb {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 0.5rem;
      border: 2px solid #6366f1;
      background: #18181b;
    }
    .upload-btn.fixed {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      max-width: 420px;
      margin: 0 auto 0 auto;
      z-index: 100;
      padding: 0.9rem 0;
      font-size: 1.1rem;
      border-radius: 0.75rem 0.75rem 0 0;
      background: linear-gradient(90deg, #22c55e 0%, #06b6d4 100%);
      color: #fff;
      border: none;
      font-weight: 600;
      box-shadow: 0 -2px 8px rgba(34,197,94,0.12);
      transition: background 0.2s, transform 0.2s;
    }
    .upload-btn.fixed:active {
      transform: scale(0.97);
    }
  `]
})
export class MobileCameraComponent implements OnInit, OnDestroy {
  private stream: MediaStream | null = null;
  previewImage: string | null = null;
  isCapturing = false;
  sessionId: string | null = null;
  isUploading = false;
  pendingPhotos: { file: File, preview: string }[] = [];
  uploadedPhotos: { url: string, path: string }[] = [];
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.params['session_id'] || this.route.snapshot.params['sessionId'];
    this.initializeCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  private async initializeCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (this.videoElementRef && this.videoElementRef.nativeElement) {
        this.videoElementRef.nativeElement.srcObject = this.stream;
      } else {
        // fallback for first load
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.srcObject = this.stream;
        }
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check camera permissions.');
    }
  }

  captureImage() {
    const videoElement = this.videoElementRef?.nativeElement || document.querySelector('video');
    if (!videoElement) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      this.previewImage = canvas.toDataURL('image/jpeg');
      this.isCapturing = true;
      this.stopCamera(); // stop feed while previewing
      this.cdr.detectChanges();
    }
  }

  retakePhoto() {
    this.previewImage = null;
    this.isCapturing = false;
    setTimeout(() => this.initializeCamera(), 100);
  }

  addPhoto() {
    if (!this.previewImage) return;
    fetch(this.previewImage)
      .then(res => res.blob())
      .then(blob => {
        const now = new Date();
        const fileName = `photo_${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        this.pendingPhotos.push({ file, preview: this.previewImage! });
        this.previewImage = null;
        this.isCapturing = false;
        setTimeout(() => this.initializeCamera(), 100); // reactivate camera
        this.cdr.detectChanges();
      });
  }

  removePhoto(index: number) {
    this.pendingPhotos.splice(index, 1);
    this.cdr.detectChanges();
  }

  async uploadAllPhotos() {
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
    if (this.pendingPhotos.length === 0) return;
    this.isUploading = true;
    try {
      for (let i = 0; i < this.pendingPhotos.length; i++) {
        const photo = this.pendingPhotos[i];
        const data = await this.storageService.uploadFile(
          'patient-docs',
          photo.file,
          (progress: number) => {
            // Optionally, update a progress bar or indicator for this photo
            console.log(`Upload progress for ${photo.file.name}: ${progress}%`);
          }
        );
        const publicUrl = await this.storageService.getPublicUrl('patient-docs', data.path);
        this.uploadedPhotos.push({ url: publicUrl, path: data.path });
      }
      this.pendingPhotos = [];
      this.cdr.detectChanges();
      alert('All photos uploaded successfully!');
    } catch (error) {
      alert('Failed to upload photos. Please try again.');
    } finally {
      this.isUploading = false;
    }
  }

  closeCamera() {
    this.stopCamera();
    window.close();
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
} 