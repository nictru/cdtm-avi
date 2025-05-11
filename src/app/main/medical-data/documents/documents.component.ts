import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MedicalRecordsService,
  DocumentWithMedicalRecord,
} from '../../../services/medical-records/medical-records.service';
import { StorageService } from '../../../services/storage/storage.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, PdfViewerModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent {
  private medicalRecordsService = inject(MedicalRecordsService);
  private storageService = inject(StorageService);

  // Access the documents with medical records resource
  userDocs = this.medicalRecordsService.userDocsWithMedicalRecordsResource;

  // Search functionality
  searchQuery = signal<string>('');
  searchMode = signal<'fast' | 'deep'>('fast');

  // Filtered documents based on search query and mode
  filteredDocs = computed(() => {
    const docs = this.userDocs.value();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return docs;

    if (this.searchMode() === 'fast') {
      // Fast search: rank by number of occurrences across all fields
      const rankedDocs = docs
        .map((doc) => {
          const occurrences = this.countOccurrences(doc, query);
          return { doc, occurrences };
        })
        .filter((item) => item.occurrences > 0)
        .sort((a, b) => b.occurrences - a.occurrences);

      return rankedDocs.map((item) => item.doc);
    } else {
      // Deep search: search in all document fields including medical record data
      return docs.filter((doc) => {
        // Search in document name and type
        if (
          this.extractDocumentName(doc.doc_name)
            .toLowerCase()
            .includes(query) ||
          doc.doc_type?.toLowerCase().includes(query)
        ) {
          return true;
        }

        // Search in medical record fields if available
        if (doc.medical_record) {
          return (
            doc.medical_record.title?.toLowerCase().includes(query) ||
            doc.medical_record.summary?.toLowerCase().includes(query) ||
            doc.medical_record.hospital_or_agency
              ?.toLowerCase()
              .includes(query) ||
            doc.medical_record.doctor_name?.toLowerCase().includes(query)
          );
        }

        return false;
      });
    }
  });

  /**
   * Counts the number of occurrences of the query in all text fields of the document
   */
  private countOccurrences(
    doc: DocumentWithMedicalRecord,
    query: string
  ): number {
    let count = 0;

    // Check document name and type
    count += this.countStringOccurrences(
      this.extractDocumentName(doc.doc_name).toLowerCase(),
      query
    );
    count += this.countStringOccurrences(
      doc.doc_type?.toLowerCase() || '',
      query
    );

    // Check medical record fields if available
    if (doc.medical_record) {
      count += this.countStringOccurrences(
        doc.medical_record.title?.toLowerCase() || '',
        query
      );
      count += this.countStringOccurrences(
        doc.medical_record.summary?.toLowerCase() || '',
        query
      );
      count += this.countStringOccurrences(
        doc.medical_record.hospital_or_agency?.toLowerCase() || '',
        query
      );
      count += this.countStringOccurrences(
        doc.medical_record.doctor_name?.toLowerCase() || '',
        query
      );
    }

    return count;
  }

  /**
   * Counts the number of non-overlapping occurrences of a substring in a string
   */
  private countStringOccurrences(str: string, subStr: string): number {
    if (!str || !subStr) return 0;

    let count = 0;
    let position = 0;

    while ((position = str.indexOf(subStr, position)) !== -1) {
      count++;
      position += subStr.length;
    }

    return count;
  }

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

  closeDocument(): void {
    this.activeDocId.set(undefined);
  }

  setSearchMode(mode: 'fast' | 'deep'): void {
    this.searchMode.set(mode);
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
