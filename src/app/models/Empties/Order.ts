import { Order } from '../RestModels/Order';

export function order(): Order {
	return {
		id: 0, 
		ecommerce_id: 0, 
		order_number: null, 
		status: 'PENDING', 
		pos_order_id: null, 
		pos_order_json: null, 
		order_date: new Date(), 
		notes: null, 
		created_by_user_id: null, 
		created: new Date(), 
		updated: new Date(), 
	};
}
