import { Transaction } from '../RestModels/Transaction';

export function transaction(): Transaction {
	return {
		id: 0, 
		account_id: 0, 
		qty: 0, 
		movement_qty: 0, 
		movement_type: 'NEGATIVE', 
		created: new Date(), 
		updated: null, 
		order_id: 0, 
	};
}
