import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MedicalRecordsService,
  DocumentWithMedicalRecord,
} from '../../services/medical-records/medical-records.service';
import { ChatComponent } from './chat/chat.component';
import { DocumentsComponent } from './documents/documents.component';
import {
  AllergiesService,
  Allergy,
  CreateAllergyDto,
} from '../../services/allergies/allergies.service';

@Component({
  selector: 'app-medical-data',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, DocumentsComponent],
  templateUrl: './medical-data.component.html',
  styleUrl: './medical-data.component.css',
})
export class MedicalDataComponent {
  private medicalRecordsService = inject(MedicalRecordsService);
  private allergiesService = inject(AllergiesService);

  activeTab = signal('general'); // Either 'general', 'documents', or 'chat'

  // Access the documents with medical records resource
  userDocs = this.medicalRecordsService.userDocsWithMedicalRecordsResource;
  // Access the allergies resource
  userAllergies = this.allergiesService.userAllergiesResource;

  // Dialog state
  showDialog = signal(false);
  errorMessage = signal('');
  newAllergy: CreateAllergyDto = {
    substance: '',
    reaction: '',
    severity: 'Mild',
  };

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  showAddAllergyDialog() {
    this.showDialog.set(true);
    this.errorMessage.set('');
    this.newAllergy = {
      substance: '',
      reaction: '',
      severity: 'Mild',
    };
  }

  closeDialog() {
    this.showDialog.set(false);
    this.errorMessage.set('');
  }

  saveAllergy() {
    if (this.newAllergy.substance.trim()) {
      this.allergiesService
        .createAllergy(this.newAllergy)
        .then(() => {
          this.closeDialog();
        })
        .catch((error) => {
          console.error('Error creating allergy:', error);
          this.errorMessage.set('Failed to save allergy. Please try again later.');
        });
    }
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
