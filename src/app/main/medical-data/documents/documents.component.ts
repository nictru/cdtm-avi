import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  MedicalRecordsService,
  DocumentWithMedicalRecord,
} from '../../../services/medical-records/medical-records.service';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent {
  private medicalRecordsService = inject(MedicalRecordsService);
  private storageService = inject(StorageService);

  // Access the documents with medical records resource
  userDocs = this.medicalRecordsService.userDocsWithMedicalRecordsResource;

  activeDocId = signal<number | undefined>(undefined);
  activeDocPath = computed(
    () =>
      this.userDocs.value().find((doc) => doc.id === this.activeDocId())
        ?.doc_name
  );

  constructor() {
    effect(() => {
      console.log(this.activeDocUrl.value());
    });
  }

  activeDocUrl = resource({
    request: this.activeDocPath,
    loader: async (params) => {
      if (!params.request) {
        return undefined;
      }
      return this.storageService.getSignedUrl(
        'patient-docs',
        params.request,
        60 * 60 * 24 * 30
      );
    },
  });

  setActiveDoc(docId: number): void {
    // Toggle active state (if clicking the same document again, deselect it)
    this.activeDocId.set(this.activeDocId() === docId ? undefined : docId);
  }

  /**
   * Extracts the document name after the second underscore
   * Example: 6e2c8463-b131-4a50-aeb0-abfb6c0a884a/1746917358231_7vohbmmkzzv_DSC01216.JPG
   * Returns: DSC01216.JPG
   */
  extractDocumentName(fullName: string): string {
    if (!fullName) return '';

    // First, remove any path information if present
    const nameWithoutPath = fullName.includes('/')
      ? fullName.substring(fullName.lastIndexOf('/') + 1)
      : fullName;

    // Split by underscore and extract parts after the second underscore
    const parts = nameWithoutPath.split('_');

    // If there are at least 3 parts (2 underscores), return everything after the second underscore
    if (parts.length >= 3) {
      return parts.slice(2).join('_'); // Join in case there are more underscores
    }

    // If not enough underscores, return the original name
    return nameWithoutPath;
  }
}
