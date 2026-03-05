import { Quotation } from './Quotation';
import { Quotation_Attachment } from './Quotation_Attachment';

export interface QuotationInfoAttachment {
	attachment_id: number;
	description?: string;
}

export interface QuotationInfo{
	quotation: Quotation;
	quotation_attachments: Quotation_Attachment[];
}
