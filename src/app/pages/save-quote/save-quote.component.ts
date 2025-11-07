import { Component, ViewChild, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { Quotation } from '../../models/RestModels/Quotation';
import { Quotation_Attachment } from '../../models/RestModels/Quotation_Attachment';
import { GetEmpty } from '../../models/GetEmpty';
import { Rest } from '../../classes/Rest';

@Component({
  selector: 'app-save-quote',
  imports: [CommonModule, FormsModule],
  templateUrl: './save-quote.component.html',
  styleUrl: './save-quote.component.css'
})
export class SaveQuoteComponent extends BaseComponent {
  quotation: Quotation = GetEmpty.quotation();
  selectedFiles: File[] = [];
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;

  @ViewChild('quoteForm') quoteForm!: NgForm;

  rest_quotation: Rest<Quotation, Quotation>;
  rest_quotation_attachment: Rest<Quotation_Attachment, Quotation_Attachment>;
  rest_image: Rest<any, any>;

  constructor(injector: Injector) {
    super(injector);
    this.rest_quotation = new Rest<Quotation, Quotation>(this.rest, 'quotation.php');
    this.rest_quotation_attachment = new Rest<Quotation_Attachment, Quotation_Attachment>(this.rest, 'quotation_attachment.php');
    this.rest_image = new Rest<any, any>(this.rest, 'image.php');
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Convert FileList to Array and append to existing files
      const filesArray = Array.from(input.files);
      this.selectedFiles.push(...filesArray);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async submitQuote(): Promise<void> {
    if (this.quoteForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      // Step 1: Create the quotation
      const createdQuotation = await this.rest_quotation.create(this.quotation);

      // Step 2: Upload files and link them to the quotation
      if (this.selectedFiles.length > 0) {
        await this.uploadFiles(createdQuotation.id!);
      }

      // Show success message
      this.showSuccessMessage = true;
      this.rest.showSuccess('Solicitud de cotización enviada correctamente');

    } catch (error: any) {
      this.rest.showError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async uploadFiles(quotationId: number): Promise<void> {
    const uploadPromises = this.selectedFiles.map(async (file) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Upload file to image.php
        const response = await fetch(this.rest.base_url + '/image.php', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.rest.bearer
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload file: ' + file.name);
        }

        const imageData = await response.json();

        // Link the uploaded image to the quotation
        const attachment: Quotation_Attachment = {
          quotation_id: quotationId,
          image_id: imageData.id
        };

        await this.rest_quotation_attachment.create(attachment);
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        throw error;
      }
    });

    await Promise.all(uploadPromises);
  }

  resetForm(): void {
    this.quotation = GetEmpty.quotation();
    this.selectedFiles = [];
    this.showSuccessMessage = false;
    this.quoteForm.resetForm();
  }
}
