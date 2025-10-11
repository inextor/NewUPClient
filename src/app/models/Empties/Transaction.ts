import { Transaction } from '../RestModels/Transaction';

export function transaction(): Transaction {
	return {
		id: 0, 
		account: 0, 
		qty: 0, 
		movement_qty: 0, 
		movement_type: 'NEGATIVE', 
		created: 0, 
		updated: 0, 
		order_id: 0, 
	};
}
