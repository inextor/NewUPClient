import { Order } from '../RestModels/Order';

export function order(): Order {
	return {
		id: 0,
		ecommerce_id: 0,
		user_id: null,
		customer_name: null,
		customer_email: null,
		customer_phone: null,
		shipping_address: null,
		shipping_city: null,
		shipping_state: null,
		shipping_postal_code: null,
		shipping_country: 'Mexico',
		subtotal: 0,
		tax_amount: 0,
		shipping_cost: 0,
		total_amount: 0,
		items_count: 0,
		order_number: null,
		status: 'PENDING',
		pos_order_id: null,
		pos_order_json: null,
		order_date: new Date(),
		notes: null,
		updated_by_user_id: null,
		created_by_user_id: null,
		created: new Date(),
		updated: new Date(),
	};
}
