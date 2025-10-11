import { Account } from '../RestModels/Account';

export function account(): Account {
	return {
		id: 0, 
		user_id: 0, 
		item_id: 0, 
		period_amount: 0, 
		period_type: 'DAY', 
		start_date: '', 
		period_end: '', 
		created: new Date(), 
		updated: new Date(), 
	};
}
