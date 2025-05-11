import {
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadComponent } from '../../../components/upload/upload.component';
import { DocsService } from '../../../services/docs/docs.service';
import { RelevantDoctorsComponent } from './relevant-doctors/relevant-doctors.component';

@Component({
  selector: 'app-relevant-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UploadComponent,
    RelevantDoctorsComponent,
  ],
  templateUrl: './relevant-documents.component.html',
  styleUrl: './relevant-documents.component.css',
})
export class RelevantDocumentsComponent {
  private docsService = inject(DocsService);
  private docsResource = this.docsService.userDocsResource;

  uploadedFileUrls = signal<string[]>([]);

  // Signal to control the visibility of the doctors modal
  showDoctorsModal = signal<boolean>(false);

  // Output event for when the user wants to go back
  goBack = output<void>();

  constructor() {
    effect(() => {
      console.log('Resource:', this.docsResource.value());
    });

    effect(() => {
      console.log('Uploaded files:', this.uploadedFileUrls());
    });

    effect(() => {
      console.log('All processed:', this.allProcessed());
    });
  }

  allProcessed = computed(() => {
    const currentURLs = this.uploadedFileUrls();
    const existingNames = this.docsResource.value().map((doc) => doc.doc_name);

    // Check if for every currentURL there is an existingName that is a suffix of the currentURL
    return currentURLs.every((url) =>
      existingNames.some((name) => url.endsWith(name))
    );
  });

  // Output event for when the user continues to the next step
  continueToNext = output<void>();

  // Method to emit go back event
  onGoBack() {
    this.goBack.emit();
  }

  // Method called when user clicks "Continue" button
  onContinueClick() {
    // Show the doctors modal instead of completing immediately
    this.showDoctorsModal.set(true);
  }

  // Method called when user clicks "Yes" on doctors modal
  onDoctorsYes() {
    console.log('User approved requesting data from previous doctors');
    this.showDoctorsModal.set(false);
    this.continueToNext.emit();
  }

  // Method called when user clicks "No" on doctors modal
  onDoctorsNo() {
    this.showDoctorsModal.set(false);
    this.continueToNext.emit();
  }

  // Handle files uploaded event from UploadComponent
  onFilesUploaded(fileUrls: string[]) {
    this.uploadedFileUrls.set(fileUrls);
  }
}
