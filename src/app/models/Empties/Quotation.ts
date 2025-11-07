import { Quotation } from "../RestModels/Quotation";

export function GetEmpty_Quotation(): Quotation
{
	return {
		status: 'PENDING'
	};
}
