import { Pos_Order } from '../RestModels/Pos_Order';

export function pos_order(): Pos_Order {
	return {
		id: 0, 
		payload_json: 0, 
		order_id: null, 
		created: 0, 
		user_id: 0, 
	};
}
