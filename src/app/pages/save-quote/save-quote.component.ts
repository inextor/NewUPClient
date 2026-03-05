import { Component, ViewChild, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { Quotation } from '../../models/RestModels/Quotation';
import { QuotationInfoAttachment, QuotationInfo } from '../../models/RestModels/QuotationInfo';
import { GetEmpty } from '../../models/GetEmpty';
import { Rest } from '../../classes/Rest';
import { Quotation_Attachment } from '../../models/RestModels/Quotation_Attachment';


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

  rest_quotation_info: Rest<Quotation, QuotationInfo>;

  constructor(injector: Injector) {
    super(injector);
    this.rest_quotation_info = new Rest<Quotation, QuotationInfo>(this.rest, 'quotation_info.php');
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
      // Step 1: Upload files and collect attachment IDs
      const attachments: Quotation_Attachment[] = await this.uploadFiles();

      // Step 2: Create quotation with attachments in a single transaction
      const request: QuotationInfo= {
        quotation: this.quotation,
        quotation_attachments: attachments
      };

      await this.rest_quotation_info.create(request);

      // Show success message
      this.showSuccessMessage = true;
      this.rest.showSuccess('Solicitud de cotización enviada correctamente');

    } catch (error: any) {
      this.rest.showError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async uploadFiles(): Promise<Quotation_Attachment[]> {
    const uploadPromises = this.selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.rest.base_url + '/attachment.php', {
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

      return {
        attachment_id: imageData.id,
        description: file.name
      } as Quotation_Attachment;
    });

    return Promise.all(uploadPromises);
  }

  resetForm(): void {
    this.quotation = GetEmpty.quotation();
    this.selectedFiles = [];
    this.showSuccessMessage = false;
    this.quoteForm.resetForm();
  }
}
